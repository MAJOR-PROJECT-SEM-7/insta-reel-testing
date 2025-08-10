import { useEffect, useState } from "react";
import { checkLogin } from "../utils";

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const result = await checkLogin();
            if (result.success && result.user) {
                setUser(result.user);
            } else {
                onLogout();
            }
            setLoading(false);
        };

        verifyAuth();
    }, [onLogout]);

    const handleLogout = () => {
        localStorage.removeItem("insta_token");
        onLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Insta Reel Testing Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Welcome to Dashboard
                            </h2>
                            <p className="text-gray-600">
                                You are successfully logged in as {user?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
