// src/Styles.js

export const getStatusStyle = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold capitalize transition-colors duration-200";
    const styles = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        returned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return `${base} ${styles[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`;
};

export const getFineStyle = (fineAmount, finePaid) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-200";
    if (fineAmount === 0)
        return `${base} bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100`;
    return finePaid
        ? `${base} bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200`
        : `${base} bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200`;
};

