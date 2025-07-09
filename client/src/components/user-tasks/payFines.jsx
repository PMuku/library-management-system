import { useEffect, useState } from 'react';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PayFines() {
    const [totalFine, setTotalFine] = useState(0);
    const [totalBooks, setTotalBooks] = useState(0);
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);

    const fetchFine = async () => {
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/users/fines`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetchWithAuth fine');
            const data = await res.json();
            setTotalFine(data.totalFine);
            setTotalBooks(data.totalBooks);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchFine();
    }, []);

    const handlePay = async () => {
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/users/pay-fine`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to pay fine');
            }
            alert('Fine paid successfully!');
            setPaid(true);
            setTotalFine(0);
            setTotalBooks(0);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Pending Fines
            </h2>

            {error && (
                <div className="relative flex items-start gap-2 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 text-sm animate-fade-in shadow-sm mb-4">
                    <span className="material-icons text-base">error_outline</span>
                    <div className="flex-1">{error}</div>
                    <button
                        onClick={() => setError('')}
                        className="absolute top-1 right-2 text-red-600 dark:text-red-300 hover:text-red-800"
                        aria-label="Close error"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            )}

            {paid || totalFine === 0 ? (
                <div className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-4 rounded-md text-center font-medium shadow">
                    No outstanding fines!
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                        <span className="font-semibold">No. of fined books:</span> {totalBooks}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                        <span className="font-semibold">Total Fine:</span> ₹{totalFine}
                    </p>
                    <button
                        onClick={handlePay}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition"
                    >
                        Pay Fine
                    </button>
                </div>
            )}
        </div>
    );
}

export default PayFines;
