import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PayFines() {
    const [totalFine, setTotalFine] = useState(0);
    const [totalBooks, setTotalBooks] = useState(0);
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);

    const fetchFine = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/fines`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch fine');
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
            const res = await fetch(`${BACKEND_URL}/api/users/pay-fine`, {
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
        <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Pending Fines</h2>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">
                    {error}
                </div>
            )}

            {paid || totalFine === 0 ? (
                <div className="text-green-700 bg-green-100 p-4 rounded text-center font-medium">
                    No outstanding fines!
                </div>
            ) : (
                <div className="text-center space-y-3">
                    <p className="text-gray-700 text-lg">
                        <span className="font-semibold">No. of fined books:</span> {totalBooks}
                    </p>
                    <p className="text-gray-700 text-lg">
                        <span className="font-semibold">Total Fine:</span> ₹{totalFine}
                    </p>
                    <button
                        onClick={handlePay}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                        Pay Fine
                    </button>
                </div>
            )}
        </div>
    );

}

export default PayFines;
