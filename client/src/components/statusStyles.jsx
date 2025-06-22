// src/statusStyles.js

export const getStatusStyle = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold capitalize";
    const styles = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        returned: "bg-blue-100 text-blue-800",
    };
    return `${base} ${styles[status] || "bg-gray-100 text-gray-800"}`;
};
