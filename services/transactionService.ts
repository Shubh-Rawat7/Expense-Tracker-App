import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";
import { getLast12Months, getLast7Days, getYearRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const { id, type, walletId, amount, image } = transactionData;
        if (!amount || amount <= 0 || !walletId || !type) {
            return { success: false, msg: "Invalid transaction data!" };
        }

        if (id) {
            const oldTransactionSnapShot = await getDoc(doc(firestore, "transactions", id));
            const oldTransaction = oldTransactionSnapShot.data() as TransactionType;
            const shouldRevertOriginal =
                oldTransaction.type !== type ||
                oldTransaction.amount !== amount ||
                oldTransaction.walletId !== walletId;

            if (shouldRevertOriginal) {
                let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
                if (!res.success) return res;
            }
        } else {
            // update wallet for new transaction
            let res = await updateWalletForNewTransaction(walletId, Number(amount!), type);
            if (!res.success) return res;
        }

        if (image) {
            const imageUploadRes = await uploadFileToCloudinary(image, "transactions");
            if (!imageUploadRes.success) {
                return { success: false, msg: imageUploadRes.msg || "Failed to upload receipt" };
            }
            transactionData.image = imageUploadRes.data;
        }

        // Remove undefined fields (like image if not uploaded)
        Object.keys(transactionData).forEach((key) => {
            if (transactionData[key as keyof typeof transactionData] === undefined) {
                delete transactionData[key as keyof typeof transactionData];
            }
        });

        const transactionRef = id
            ? doc(firestore, "transactions", id)  // <-- fixed typo here from "transaction" to "transactions"
            : doc(collection(firestore, "transactions"));

        await setDoc(transactionRef, transactionData, { merge: true });

        return { success: true, data: { ...transactionData, id: transactionRef.id } };
    } catch (err: any) {
        console.log("error creating or updating transaction: ", err);
        return { success: false, msg: err.message };
    }
};


const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnashot = await getDoc(walletRef);
        if (!walletSnashot.exists()) {
            console.log('error updating wallet for new transaction: ');
            return { success: false, msg: "Wallet not found." }
        }
        const walletData = walletSnashot.data() as WalletType;
        if (type == "expense" && walletData.amount! - amount < 0) {
            return {
                success: false,
                msg: "selected wallet don't have enough balance"
            };
        }
        const updateType = type == 'income' ? 'totalIncome' : 'totalExpenses';

        const updatedWalletAmount = type == "income" ? Number(walletData.amount) + amount : Number(walletData.amount) - amount;

        const updatedTotals = type == "income" ? Number(walletData.totalIncome) + amount : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals
        })

        return { success: true };
    } catch (err: any) {
        console.log('error updating wallet for new transaction: ', err);
        return { success: false, msg: err.message }
    }
};

const revertAndUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newTransactionType: string,
    newWalletId: string
) => {
    try {
        const originalWalletSnashot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId));

        const originalWallet = originalWalletSnashot.data() as WalletType;

        let newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
        let newWallet = newWalletSnapshot.data() as WalletType;

        const revertType = oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

        const revertIncomeExpense: number = oldTransaction.type == "income" ? -Number(oldTransaction.amount) : Number(oldTransaction.amount);

        const revertWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;
        // wallet amount, after transaction is removed

        const revertIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount);

        if (newTransactionType == 'expense') {
            // if user tries to convert income to expense on the same wallet
            // or if the user tris to increase the expense amount and don't have enough balance 
            if (oldTransaction.walletId == newWalletId && revertWalletAmount < newTransactionAmount) {
                return { success: false, msg: "The selected wallet don't have enough balance." };
            }

            // if user tries to add expense from a new wallet but the wallet don't have enough balance
            if (newWallet.amount! < newTransactionAmount) {
                return { success: false, msg: "The selected wallet don't have enough balance." };
            }
        }

        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertWalletAmount,
            [revertType]: revertIncomeExpenseAmount,
        });

        // revert completed

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // refetch the newwallet because we may have just updated it  
        newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
        newWallet = newWalletSnapshot.data() as WalletType;

        const updateType = newTransactionType == "income" ? "totalIncome" : "totalExpenses";

        const updatedTransactionAmount: number = newTransactionType == "income" ? Number(newTransactionAmount) : -Number(newTransactionAmount);

        const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

        const newIncomeExpenseAmount = Number(newWallet[updateType]! + Number(newTransactionAmount));

        await createOrUpdateWallet({
            id: newWalletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        })

        return { success: true };
    } catch (err: any) {
        console.log('error updating wallet for new transaction: ', err);
        return { success: false, msg: err.message }
    }
};

export const deleteTransaction = async (
    transactionId: string,
    walletId: string
) => {
    try {
        const transactionRef = doc(firestore, "transactions", transactionId)
        const transactionSnapShot = await getDoc(transactionRef);

        if (!transactionSnapShot.exists()) {
            return { success: false, msg: "Transaction not found" }
        }

        const transactionData = transactionSnapShot.data() as TransactionType;

        const transactionType = transactionData?.type;
        const transactionAmount = transactionData?.amount;

        // fetch wallet to update amount, totalIncome or toatlExpenses
        const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
        const walletData = walletSnapshot.data() as WalletType;

        // check fields to be updated based on transaction type
        const updateType = transactionType == 'income' ? "totalIncome" : "totalExpenses";

        const newWalletAmount = walletData?.amount! - (transactionType == "income" ? transactionAmount : -transactionAmount);

        const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

        // if its expense and the wallet amount can go below zero
        if (transactionType == 'expense' && newWalletAmount < 0) {
            return { success: false, msg: "You cannot delete this transaction" }
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        });

        await deleteDoc(transactionRef);

        return { success: true };
    } catch (err: any) {
        console.log('error updating wallet for new transaction: ', err);
        return { success: false, msg: err.message }
    }
};


export const fetchWeeklyStats = async (
    uid: string
): Promise<ResponseType> => {
    try {
        const db = firestore;
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const transactionQuery = query(
            collection(db, "transactions"),
            where("uid", "==", uid),
            where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),

        );

        const querySnapshot = await getDocs(transactionQuery);
        const weeklyData = getLast7Days();
        const transactions: TransactionType[] = [];

        // maping each transaction in day
        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0]; // as specific date

            const dayData = weeklyData.find((day) => day.date == transactionDate);

            if (dayData) {
                if (transaction.type == 'income') {
                    dayData.income += transaction.amount;
                } else if (transaction.type == 'expense') {
                    dayData.expense += transaction.amount;
                }
            }
        });

        // takes each day and creates two enteries in arary
        const stats = weeklyData.flatMap((day) => [
            {
                value: day.income,
                label: day.day,
                spacing: scale(4),
                labelWidth: scale(30),
                frontColor: colors.primary
            },
            {
                value: day.expense,
                frontColor: colors.rose,
            }
        ]);

        return { success: true, data: { stats, transactions } };
    } catch (error) {
        console.log('Error fetching weekly transaction: ', error);
        return { success: false, msg: "Failed to fetch weekly transactions" }
    }
};

export const fetchMonthlyStats = async (
    uid: string
): Promise<ResponseType> => {
    try {
        const db = firestore;
        const today = new Date();
        const twelveMonthAgo = new Date(today);
        twelveMonthAgo.setMonth(today.getMonth() - 12);

        const transactionQuery = query(
            collection(db, "transactions"),
            where("uid", "==", uid),
            where("date", ">=", Timestamp.fromDate(twelveMonthAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),

        );

        const querySnapshot = await getDocs(transactionQuery);
        const monthlyData = getLast12Months();
        const transactions: TransactionType[] = [];

        // process transactions to calculate income and expense for each month
        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate();
            const monthName = transactionDate.toLocaleString("default", { month: "short" });
            const shortYear = transactionDate.getFullYear().toString().slice(-2);
            const monthData = monthlyData.find((month) => month.month === `${monthName} ${shortYear}`);


            if (monthData) {
                if (transaction.type == 'income') {
                    monthData.income += transaction.amount;
                } else if (transaction.type == 'expense') {
                    monthData.expense += transaction.amount;
                }
            }
        });

        // Reformat monthlydata for the bar chart with income and expense entries for each month
        const stats = monthlyData.flatMap((month) => [
            {
                value: month.income,
                label: month.month,
                spacing: scale(4),
                labelWidth: scale(46),
                frontColor: colors.primary
            },
            {
                value: month.expense,
                frontColor: colors.rose,
            }
        ]);

        return { success: true, data: { stats, transactions } };
    } catch (error) {
        console.log('Error fetching monthly transaction: ', error);
        return { success: false, msg: "Failed to fetch monthly transactions" }
    }
};

export const fetchYearlyStats = async (
    uid: string
): Promise<ResponseType> => {
    try {
        const db = firestore;


        const transactionQuery = query(
            collection(db, "transactions"),
            where("uid", "==", uid),
            orderBy("date", "desc"),

        );

        const querySnapshot = await getDocs(transactionQuery);
        const transactions: TransactionType[] = [];

        const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
            const transactionDate = doc.data().date.toDate();
            return transactionDate < earliest ? transactionDate : earliest;
        }, new Date());

        const firstYear = firstTransaction.getFullYear();
        const currentYear = new Date().getFullYear();

        const yearlyData = getYearRange(firstYear, currentYear);


        // process transactions to calculate income and expense for each month
        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();

            const yearData = yearlyData.find((item: any) => item.year === transactionYear.toString());


            if (yearData) {
                if (transaction.type == 'income') {
                    yearData.income += transaction.amount;
                } else if (transaction.type == 'expense') {
                    yearData.expense += transaction.amount;
                }
            }
        });

        const stats = yearlyData.flatMap((year: any) => [
            {
                value: year.income,
                label: year.year,
                spacing: scale(4),
                labelWidth: scale(35),
                frontColor: colors.primary
            },
            {
                value: year.expense,
                frontColor: colors.rose,
            }
        ]);

        return { success: true, data: { stats, transactions } };
    } catch (error) {
        console.log('Error fetching yearly transaction: ', error);
        return { success: false, msg: "Failed to fetch yearly transactions" }
    }
};