import { useEffect, useMemo, useState } from "react";
import {
    checkLogin,
    getTestEntries,
    getTestEntry,
    checkAuthenticity,
    createTestEntry,
} from "../utils";
import type {
    OneTestEntry,
    OneTestDetailedEntry,
    APIResponse,
    Feedback,
} from "../types";

interface DashboardProps {
    onLogout: () => void;
}

function Loader({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="flex items-center gap-3 text-gray-700">
                <svg
                    className="animate-spin h-5 w-5 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
                <span>{label}</span>
            </div>
        </div>
    );
}

function RatingInput({
    label,
    name,
    value,
    onChange,
}: {
    label: string;
    name: keyof Feedback;
    value: number;
    onChange: (name: keyof Feedback, value: number) => void;
}) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} (1-10)
            </label>
            <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={value}
                onChange={(e) => onChange(name, Number(e.target.value))}
                className="w-full"
            />
            <div className="text-sm text-gray-600">Selected: {value}</div>
        </div>
    );
}

function TextareaInput({
    label,
    name,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    name: keyof Feedback;
    value: string;
    onChange: (name: keyof Feedback, value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                className="w-full border rounded-md p-2"
                rows={3}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                required
            />
        </div>
    );
}

function ResponseDetails({ worthy, response }: { worthy: boolean; response: any }) {
    const res = response as any;
    const renderClaims = (claims: any[] | undefined) => {
        if (!claims || !Array.isArray(claims) || claims.length === 0) return <div className="text-gray-600">No claims available.</div>;
        return (
            <div className="space-y-3">
                {claims.map((c, idx) => (
                    <div key={idx} className="border rounded-md p-3">
                        <div className="font-medium text-gray-900">{c.claim ?? "Claim"}</div>
                        {c.evidence && (
                            <div className="text-sm text-gray-700 mt-1"><span className="font-medium">Evidence:</span> {c.evidence}</div>
                        )}
                        {typeof c.is_worth_verifying === "boolean" && (
                            <div className="text-sm text-gray-700 mt-1">Worth Verifying: {c.is_worth_verifying ? "Yes" : "No"}</div>
                        )}
                        {typeof c.can_verify_with_llm === "boolean" && (
                            <div className="text-sm text-gray-700 mt-1">Can Verify with LLM: {c.can_verify_with_llm ? "Yes" : "No"}</div>
                        )}
                        {c.verification_method && (
                            <div className="text-sm text-gray-700 mt-1"><span className="font-medium">Verification Method:</span> {c.verification_method}</div>
                        )}
                        {typeof c.authenticity_score === "number" && (
                            <div className="text-sm text-gray-700 mt-1">Authenticity Score: {c.authenticity_score}</div>
                        )}
                        {c.authenticity_label && (
                            <div className="text-sm text-gray-700 mt-1">Authenticity Label: {c.authenticity_label}</div>
                        )}
                        {c.explanation && (
                            <div className="text-sm text-gray-700 mt-1"><span className="font-medium">Explanation:</span> {c.explanation}</div>
                        )}
                        {Array.isArray(c.evidence_sources) && c.evidence_sources?.length > 0 && (
                            <div className="text-sm text-gray-700 mt-1"><span className="font-medium">Evidence Sources:</span>
                                <ul className="list-disc ml-5">
                                    {c.evidence_sources.map((s: string, i: number) => (
                                        <li key={i} className="break-all">{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {typeof c.confidence === "number" && (
                            <div className="text-sm text-gray-700 mt-1">Confidence: {c.confidence}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-semibold text-gray-800 mb-2">Link</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div>Filename: {res?.link?.filename ?? "N/A"}</div>
                        <div>Width: {res?.link?.width ?? "N/A"}</div>
                        <div>Height: {res?.link?.height ?? "N/A"}</div>
                        <div className="break-all">Video URL: {res?.link?.videoUrl ?? "N/A"}</div>
                        <div>Success: {String(res?.link?.success ?? "")}</div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-semibold text-gray-800 mb-2">Video and Audio</div>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div>Success: {String(res?.video_and_audio?.success ?? "")}</div>
                        <div className="break-all">Video: {res?.video_and_audio?.video ?? "N/A"}</div>
                        <div className="break-all">Audio: {res?.video_and_audio?.audio ?? "N/A"}</div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">Transcription</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{res?.transcription ?? "N/A"}</div>
            </div>

            <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">Description & Analysis</div>
                <div className="text-sm text-gray-700 space-y-2">
                    <div>Success: {String(res?.description?.success ?? "")}</div>
                    <div>Category: {res?.description?.analysis?.category ?? "N/A"}</div>
                    <div>Summary: {res?.description?.analysis?.summary ?? "N/A"}</div>
                    {typeof res?.description?.analysis?.is_worthy === "boolean" && (
                        <div>Is Worthy: {res?.description?.analysis?.is_worthy ? "Yes" : "No"}</div>
                    )}
                    {res?.description?.analysis?.why_not_worthy && (
                        <div>Why Not Worthy: {res?.description?.analysis?.why_not_worthy}</div>
                    )}
                    <div className="mt-2">
                        <div className="font-medium">Claims</div>
                        {renderClaims(res?.description?.analysis?.claims)}
                    </div>
                </div>
            </div>

            {worthy ? (
                <>
                    <div className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm font-semibold text-gray-800 mb-2">If Worthy Response</div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div>Overall Authenticity: {res?.if_worthy_response?.overall_authenticity ?? "N/A"}</div>
                            <div>Overall Score: {res?.if_worthy_response?.overall_score ?? "N/A"}</div>
                            <div>Summary: {res?.if_worthy_response?.summary ?? "N/A"}</div>
                            <div>Recommendation: {res?.if_worthy_response?.recommendation ?? "N/A"}</div>
                            <div className="mt-2">
                                <div className="font-medium">Individual Claims</div>
                                {renderClaims(res?.if_worthy_response?.individual_claims)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Final</div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div>Overall Authenticity: {res?.final?.overall_authenticity ?? "N/A"}</div>
                            <div>Overall Score: {res?.final?.overall_score ?? "N/A"}</div>
                            <div>Summary: {res?.final?.summary ?? "N/A"}</div>
                            <div>Recommendation: {res?.final?.recommendation ?? "N/A"}</div>
                            <div className="mt-2">
                                <div className="font-medium">Individual Claims</div>
                                {renderClaims(res?.final?.individual_claims)}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Not Worthy Response</div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div>Summary: {res?.not_worthy_response?.summary ?? "N/A"}</div>
                            <div>Reason: {res?.not_worthy_response?.reason ?? "N/A"}</div>
                            <div>Category: {res?.not_worthy_response?.category ?? "N/A"}</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Final</div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div>Summary: {res?.final?.summary ?? "N/A"}</div>
                            <div>Reason: {res?.final?.reason ?? "N/A"}</div>
                            <div>Category: {res?.final?.category ?? "N/A"}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function DetailsView({ entry }: { entry: OneTestDetailedEntry }) {
    const isWorthy = entry.worthy;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Test Entry</h2>
                        <p className="text-sm text-gray-600">ID: {entry._id}</p>
                    </div>
                    <div>
                        <span
                            className={
                                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium " +
                                (isWorthy
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800")
                            }
                        >
                            {isWorthy ? "Worthy" : "Not Worthy"}
                        </span>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                        <div className="font-medium">Reel ID</div>
                        <div>{entry.insta_reel_id}</div>
                    </div>
                    <div>
                        <div className="font-medium">User</div>
                        <div>{entry.user_email}</div>
                    </div>
                    <div>
                        <div className="font-medium">Created</div>
                        <div>{new Date(entry.created_at).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Response</h3>
                <ResponseDetails worthy={isWorthy} response={entry.response} />
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="font-medium">Transcript Rating</div>
                        <div>{entry.feedback.transcript_rating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Description Rating</div>
                        <div>{entry.feedback.description_rating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Worthy Checked Correctly</div>
                        <div>{entry.feedback.worthy_checked_correctly ? "Yes" : "No"}</div>
                    </div>
                    <div>
                        <div className="font-medium">Not Worthy Reason Rating</div>
                        <div>{entry.feedback.not_worthy_reason_rating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Worthy Reason Rating</div>
                        <div>{entry.feedback.worthy_reason_rating}</div>
                    </div>
                    <div>
                        <div className="font-medium">URLs Fetched Rating</div>
                        <div>{entry.feedback.urls_fetched_rating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Final Rating</div>
                        <div>{entry.feedback.final_rating}</div>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                    <div>
                        <div className="font-medium">Transcript Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.transcript_feedback}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Description Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.description_feedback}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Not Worthy Reason Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.not_worthy_reason_feedback}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Worthy Reason Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.worthy_reason_feedback}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">URLs Fetched Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.urls_fetched_feedback}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Final Feedback</div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {entry.feedback.final_feedback}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [entries, setEntries] = useState<OneTestEntry[] | null>(null);
    const [entriesLoading, setEntriesLoading] = useState<boolean>(true);
    const [entriesError, setEntriesError] = useState<string>("");

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [details, setDetails] = useState<OneTestDetailedEntry | null>(null);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [detailsError, setDetailsError] = useState<string>("");

    const [showNewTest, setShowNewTest] = useState<boolean>(false);
    const [testUrl, setTestUrl] = useState<string>("");
    const [checking, setChecking] = useState<boolean>(false);
    const [checkError, setCheckError] = useState<string>("");
    const [checkResult, setCheckResult] = useState<APIResponse | null>(null);

    const [saving, setSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string>("");

    const defaultFeedback: Feedback = useMemo(
        () => ({
            transcript_rating: 5,
            transcript_feedback: "",
            description_rating: 5,
            description_feedback: "",
            worthy_checked_correctly: true,
            not_worthy_reason_rating: 5,
            not_worthy_reason_feedback: "",
            worthy_reason_rating: 5,
            worthy_reason_feedback: "",
            urls_fetched_rating: 5,
            urls_fetched_feedback: "",
            final_rating: 5,
            final_feedback: "",
        }),
        []
    );
    const [feedback, setFeedback] = useState<Feedback>(defaultFeedback);

    useEffect(() => {
        const verifyAuth = async () => {
            const result = await checkLogin();
            if (result.success && result.user) {
                setUser(result.user);
            } else {
                onLogout();
            }
            setAuthLoading(false);
        };
        verifyAuth();
    }, [onLogout]);

    useEffect(() => {
        const fetchEntries = async () => {
            setEntriesLoading(true);
            setEntriesError("");
            const result = await getTestEntries();
            if (result.success && result.data) {
                setEntries(result.data);
                setShowNewTest(result.data.length === 0);
            } else {
                setEntries([]);
                setEntriesError(result.error || "Failed to load entries");
            }
            setEntriesLoading(false);
        };
        fetchEntries();
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        const fetchDetails = async () => {
            setDetailsLoading(true);
            setDetailsError("");
            const result = await getTestEntry(selectedId);
            if (result.success && result.data) {
                setDetails(result.data);
            } else {
                setDetails(null);
                setDetailsError(result.error || "Failed to load entry details");
            }
            setDetailsLoading(false);
        };
        fetchDetails();
    }, [selectedId]);

    const handleSelectEntry = (id: string) => {
        setShowNewTest(false);
        setSelectedId(id);
        setCheckResult(null);
        setCheckError("");
    };

    const extractReelId = (url: string): string => {
        try {
            const parsed = new URL(url);
            const segments = parsed.pathname.split("/").filter(Boolean);
            const reelIndex = segments.findIndex((s) => s === "reel" || s === "p");
            if (reelIndex !== -1 && segments[reelIndex + 1]) {
                return segments[reelIndex + 1];
            }
            return segments[segments.length - 1] || "";
        } catch {
            const parts = url.split("/").filter(Boolean);
            return parts[parts.length - 1] || "";
        }
    };

    const handleCheckAuthenticity = async () => {
        setChecking(true);
        setCheckError("");
        setCheckResult(null);
        try {
            const res = await checkAuthenticity(testUrl);
            if (res.success && res.data) {
                setCheckResult(res.data);
            } else {
                setCheckError(res.error || "Failed to check authenticity");
            }
        } finally {
            setChecking(false);
        }
    };

    const handleFeedbackNumberChange = (name: keyof Feedback, value: number) => {
        setFeedback((prev) => ({ ...prev, [name]: value }));
    };
    const handleFeedbackTextChange = (name: keyof Feedback, value: string) => {
        setFeedback((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveEntry = async () => {
        if (!checkResult) return;
        const instaId = extractReelId(testUrl);
        if (!instaId) {
            setSaveError("Could not extract Reel ID from URL");
            return;
        }
        setSaving(true);
        setSaveError("");
        try {
            const payload = {
                worthy: checkResult.worthy,
                response: checkResult.response,
                feedback: feedback,
                insta_reel_id: instaId,
            } as const;
            const res = await createTestEntry(payload as any);
            if (res.success) {
                const list = await getTestEntries();
                if (list.success && list.data) {
                    setEntries(list.data);
                    const newlyCreated = list.data.find((e) => e.insta_reel_id === instaId);
                    if (newlyCreated) {
                        setSelectedId(newlyCreated._id);
                        setShowNewTest(false);
                        setDetails(null);
                    }
                }
            } else {
                setSaveError(res.error || "Failed to save entry");
            }
        } finally {
            setSaving(false);
        }
    };

    const startNewTest = () => {
        setShowNewTest(true);
        setSelectedId(null);
        setDetails(null);
        setTestUrl("");
        setCheckResult(null);
        setCheckError("");
        setFeedback(defaultFeedback);
    };

    if (authLoading) {
        return <Loader label="Checking authentication..." />;
    }

    const Sidebar = (
        <aside className="w-72 bg-white border-r h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 border-b">
                <button
                    onClick={startNewTest}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    New Test
                </button>
            </div>
            <div className="p-2">
                <h3 className="px-2 py-2 text-sm font-semibold text-gray-700">Test Entries</h3>
                {entriesLoading ? (
                    <Loader label="Loading entries..." />
                ) : entries && entries.length > 0 ? (
                    <ul>
                        {entries.map((e) => (
                            <li key={e._id}>
                                <button
                                    onClick={() => handleSelectEntry(e._id)}
                                    className={
                                        "w-full text-left px-3 py-2 rounded-md mb-1 hover:bg-gray-100 " +
                                        (selectedId === e._id ? "bg-gray-100" : "")
                                    }
                                >
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {e.insta_reel_id}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {new Date(e.created_at).toLocaleString()}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-3 py-2 text-sm text-gray-600">No entries yet.</div>
                )}
                {entriesError && (
                    <div className="px-3 py-2 text-sm text-red-600">{entriesError}</div>
                )}
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Insta Reel Testing Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{user?.email}</span>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("insta_token");
                                    onLogout();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {Sidebar}
                <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto p-6">
                    {showNewTest ? (
                        <div className="space-y-6">
                            <div className="bg-white shadow rounded-lg p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    Check Authenticity
                                </h2>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        className="flex-1 border rounded-md p-2"
                                        placeholder="Enter Instagram Reel URL"
                                        value={testUrl}
                                        onChange={(e) => setTestUrl(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCheckAuthenticity}
                                        disabled={!testUrl || checking}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        {checking ? "Checking..." : "Check"}
                                    </button>
                                </div>
                                {checkError && (
                                    <div className="mt-2 text-sm text-red-600">{checkError}</div>
                                )}
                                {checking && <Loader label="This may take a while..." />}
                            </div>

                            {checkResult && (
                                <div className="space-y-6">
                                    <div className="bg-white shadow rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Authenticity Result
                                            </h3>
                                            <span
                                                className={
                                                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium " +
                                                    (checkResult.worthy
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800")
                                                }
                                            >
                                                {checkResult.worthy ? "Worthy" : "Not Worthy"}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-800 space-y-2">
                                            <ResponseDetails worthy={checkResult.worthy} response={checkResult.response} />
                                        </div>
                                    </div>

                                    <div className="bg-white shadow rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Feedback
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <RatingInput
                                                    label="Transcript Rating"
                                                    name="transcript_rating"
                                                    value={feedback.transcript_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="Transcript Feedback"
                                                    name="transcript_feedback"
                                                    value={feedback.transcript_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Your feedback on the transcript..."
                                                />
                                                <RatingInput
                                                    label="Description Rating"
                                                    name="description_rating"
                                                    value={feedback.description_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="Description Feedback"
                                                    name="description_feedback"
                                                    value={feedback.description_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Your feedback on the description..."
                                                />
                                                <RatingInput
                                                    label="Not Worthy Reason Rating"
                                                    name="not_worthy_reason_rating"
                                                    value={feedback.not_worthy_reason_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="Not Worthy Reason Feedback"
                                                    name="not_worthy_reason_feedback"
                                                    value={feedback.not_worthy_reason_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Explain the reasoning for not worthy..."
                                                />
                                            </div>
                                            <div>
                                                <RatingInput
                                                    label="Worthy Reason Rating"
                                                    name="worthy_reason_rating"
                                                    value={feedback.worthy_reason_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="Worthy Reason Feedback"
                                                    name="worthy_reason_feedback"
                                                    value={feedback.worthy_reason_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Explain the reasoning for worthy..."
                                                />
                                                <RatingInput
                                                    label="URLs Fetched Rating"
                                                    name="urls_fetched_rating"
                                                    value={feedback.urls_fetched_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="URLs Fetched Feedback"
                                                    name="urls_fetched_feedback"
                                                    value={feedback.urls_fetched_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Feedback on the URLs fetched..."
                                                />
                                                <RatingInput
                                                    label="Final Rating"
                                                    name="final_rating"
                                                    value={feedback.final_rating}
                                                    onChange={handleFeedbackNumberChange}
                                                />
                                                <TextareaInput
                                                    label="Final Feedback"
                                                    name="final_feedback"
                                                    value={feedback.final_feedback}
                                                    onChange={handleFeedbackTextChange}
                                                    placeholder="Any final feedback..."
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={feedback.worthy_checked_correctly}
                                                    onChange={(e) =>
                                                        setFeedback((prev) => ({
                                                            ...prev,
                                                            worthy_checked_correctly: e.target.checked,
                                                        }))
                                                    }
                                                />
                                                Worthy checked correctly
                                            </label>
                                        </div>
                                        {saveError && (
                                            <div className="mt-2 text-sm text-red-600">{saveError}</div>
                                        )}
                                        <div className="mt-4">
                                            <button
                                                onClick={handleSaveEntry}
                                                disabled={!checkResult || saving}
                                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                {saving ? "Saving..." : "Save Test Entry"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : detailsLoading ? (
                        <Loader label="Loading details..." />
                    ) : details ? (
                        <DetailsView entry={details} />
                    ) : detailsError ? (
                        <div className="text-red-600">{detailsError}</div>
                    ) : (
                        <div className="text-gray-600">Select an entry from the sidebar or start a new test.</div>
                    )}
                </main>
            </div>
        </div>
    );
}
