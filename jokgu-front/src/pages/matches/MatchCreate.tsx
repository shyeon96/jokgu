import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Users } from "../../types";
import { useEffect, useRef, useState } from "react";
import { PartyPopper, Plus } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import Loading from "../Loading";
import { io, Socket } from "socket.io-client";

export default function MatchCreate() {

    const { pid } = useParams();
    const navigate = useNavigate();
    const socket = useRef<Socket | null>(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ['planUsers', pid],
        queryFn: async () => {
            const response = await api.get<Users[]>(`/plans/${pid}/users`);
            return response.data;
        }
    })

    const [teamA, setTeamA] = useState<Users[]>([]);
    const [teamB, setTeamB] = useState<Users[]>([]);
    const [referee, setReferee] = useState<number | null>(null);
    const [isDeuce, setIsDeuce] = useState<number>(1);
    const [isServeCount, setIsServeCount] = useState<number>(1);
    const [targetScore, setTargetScore] = useState<number>(15);
    const [gameOption, setGameOption] = useState<string>("Bo3");
    const [aScore, setAScore] = useState<number>(0);
    const [bScore, setBScore] = useState<number>(0);
    const [serveStart, setServeStart] = useState<string>("A");
    const [aSetScore, setASetScore] = useState<number>(0);
    const [bSetScore, setBSetScore] = useState<number>(0);

    const [currentSet, setCurrentSet] = useState<number>(1);
    const [serveTeam, setServeTeam] = useState<string>(serveStart);
    const [aServeIdx, setAServeIdx] = useState<number>(0);
    const [bServeIdx, setBServeIdx] = useState<number>(0);

    const [result, setResult] = useState<string>("");

    const [history, setHistory] = useState<{ aScore: number; bScore: number; serveTeam: string; aServeIdx: number; bServeIdx: number }[]>([]);

    const isGameStarted = aScore !== 0 || bScore !== 0 || aSetScore !== 0 || bSetScore !== 0;
    const isCurrentSetStarted = aScore !== 0 || bScore !== 0;

    const currentServer = serveTeam === "A"
        ? (<p>A팀 {aServeIdx % Math.max(teamA.length, 1) + 1}번</p>)
        : (<p>B팀 {bServeIdx % Math.max(teamB.length, 1) + 1}번</p>);

    useEffect(() => {
        if (!result) return;

        confetti({ angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ angle: 120, spread: 70, origin: { x: 1 } });
    }, [result])

    useEffect(() => {

        if (result) return;

        if (gameOption === "single" && currentSet > 1) {
            toast("경기 종료");
            setResult(aSetScore > bSetScore ? "A" : "B");
            return;
        } else if ((gameOption === "Bo3" && currentSet > 3) || (aSetScore === 2 || bSetScore === 2)) {
            toast("경기 종료");
            setResult(aSetScore > bSetScore ? "A" : "B");
            return;
        }

        // 세트 승자 계산 함수
        const getSetWinner = (): "A" | "B" | null => {
            if (isDeuce === 1 && aScore >= targetScore - 1 && bScore >= targetScore - 1) {
                if (aScore - bScore >= 2) return "A";
                if (bScore - aScore >= 2) return "B";
            } else {
                if (aScore >= targetScore) return "A";
                if (bScore >= targetScore) return "B";
            }
            return null;
        };

        const setWinnerTeam = getSetWinner();
        if (setWinnerTeam) {
            toast(`${currentSet}세트 ${setWinnerTeam}팀 승`);

            // 세트 스코어 업데이트
            if (setWinnerTeam === "A") {
                setASetScore(prev => prev + 1);
            } else {
                setBSetScore(prev => prev + 1);
            }

            setCurrentSet(prev => prev + 1);
            setAScore(0);
            setBScore(0);

            // 서브권 변경
            setServeTeam(currentSet % 2 === 1 ? (serveStart === "A" ? "B" : "A") : serveStart);

            setAServeIdx(0);
            setBServeIdx(0);
            setHistory([]);
        }
    }, [aScore, bScore, aSetScore, bSetScore, gameOption, currentSet, result, isDeuce, targetScore, serveStart]);

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_WEBSOKET_URL, {
            auth: {
                token: sessionStorage.getItem("token")
            }
        });

        socket.current.on('connect', () => {
            socket.current?.emit('join', String(pid));
        })

        return () => {
            socket.current?.emit('matchEnd', String(pid));
            toast.success("경기를 취소하였습니다", { style: { background: '#22c55e', color: 'white' } });
            socket.current?.disconnect();
        }
    }, [pid]);

    const sendScore = (aScore, bScore, aSetScore, bSetScore) => {
        socket.current?.emit('updateScore', {
            pid: String(pid),
            score: {aScore, bScore, aSetScore, bSetScore}
        });
    }

    const addToTeam = (team: "A" | "B", user: Users) => {
        const setTarget = team === "A" ? setTeamA : setTeamB;
        const setOther = team === "A" ? setTeamB : setTeamA;

        setTarget(prev =>
            prev.find(u => u.uid === user.uid) ? prev.filter(u => u.uid !== user.uid) : [...prev, user]
        );
        setOther(prev => prev.filter(u => u.uid !== user.uid));
    };

    const addToTeamA = (user: Users) => addToTeam("A", user);
    const addToTeamB = (user: Users) => addToTeam("B", user);

    const isInTeamA = (uid: number) => teamA.some(u => u.uid === uid);
    const isInTeamB = (uid: number) => teamB.some(u => u.uid === uid);

    const addScore = (team: string) => {

        setHistory(prev => [...prev, { aScore, bScore, serveTeam, aServeIdx, bServeIdx }]);

        if (team === "A") {
            setAScore(prev => prev + 1);
            if (serveTeam !== "A") {
                setServeTeam("A");
                setBServeIdx(prev => prev + 1);
            }
        } else {
            setBScore(prev => prev + 1);
            if (serveTeam !== "B") {
                setServeTeam("B");
                setAServeIdx(prev => prev + 1);
            }
        }

        const newAScore = team === "A" ? aScore + 1 : aScore;
        const newBScore = team === "B" ? bScore + 1 : bScore;

        sendScore(newAScore, newBScore, aSetScore, bSetScore);
    }

    const dormammu = () => {
        if (history.length === 0) return;

        const prev = history[history.length - 1];
        setAScore(prev.aScore);
        setBScore(prev.bScore);
        setServeTeam(prev.serveTeam);
        setAServeIdx(prev.aServeIdx);
        setBServeIdx(prev.bServeIdx);
        setHistory(prev => prev.slice(0, prev.length - 1));
    }

    const { mutate: submitMatch } = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/plans/${pid}/matches`, {
                winner: result,
                referee: referee,
                game: gameOption,
                A: teamA.map(u => u.uid),
                B: teamB.map(u => u.uid)
            });

            return response.data;
        },
        onSuccess: () => {
            socket.current?.emit('matchEnd', String(pid));
            toast.success("저장되었습니다", { style: { background: '#22c55e', color: 'white' } });
            navigate(`/plans/${pid}`, { replace: true });
        },
        onError: () => {
            toast.error("에러가 발생했습니다", { style: { background: '#f43f5e', color: 'white' } });
        }
    });

    if (isLoading) return <Loading />

    if (result) return (
        <div className="h-screen overflow-hidden flex flex-col justify-center items-center p-6 gap-6 max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-1">
                <div className={`flex items-center gap-3 ${result === "A" ? "text-red-500" : "text-blue-500"}`}>
                    <PartyPopper size={28} />
                    <h1 className="text-4xl font-bold tracking-tight">{result}팀 승리</h1>
                    <PartyPopper size={28} className="scale-x-[-1]" />
                </div>
                <p className="text-xs text-slate-400 mt-1">심판: {referee ? users?.find(u => u.uid === referee)?.name : "없음"}</p>
            </div>

            <div className={`w-full rounded-2xl p-6 flex items-center justify-center gap-4`}>
                <span className="text-2xl font-bold text-red-400">A</span>
                <span className="text-5xl font-bold text-gray-800">{aSetScore} : {bSetScore}</span>
                <span className="text-2xl font-bold text-blue-400">B</span>
            </div>

            <div className="flex gap-4 w-full">
                <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-500 mb-3 uppercase tracking-wide">승리</p>
                    <div className="space-y-1.5">
                        {(result === "A" ? teamA : teamB).map(user => (
                            <p key={user.uid} className="text-sm font-medium text-gray-800">{user.name}</p>
                        ))}
                    </div>
                </div>
                <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">패배</p>
                    <div className="space-y-1.5">
                        {(result === "A" ? teamB : teamA).map(user => (
                            <p key={user.uid} className="text-sm font-medium text-gray-800">{user.name}</p>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => submitMatch()}
                className="w-full py-3.5 text-sm font-semibold bg-[#3182F6] hover:bg-[#1a6fe0] text-white rounded-xl transition">
                경기 결과 저장하기
            </button>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col items-center py-2 px-4">
            <h1 className="text-2xl font-medium text-gray-900 mt-4 mb-2">경기</h1>

            <div className="w-full max-w-2xl flex flex-col gap-3">
                <div className="flex items-stretch gap-3">
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-4 min-h-30 flex flex-col gap-1 items-center justify-center">
                        {teamA.length !== 0 ? teamA.map(user => (
                            <p key={user.uid} className="text-sm md:text-base">{user.name}</p>
                        )) :
                            <p className="text-2xl font-medium text-red-600 mb-1">A팀</p>}
                    </div>
                    <div className="flex items-center justify-center px-2">
                        <p className="text-lg font-bold text-gray-600">VS</p>
                    </div>
                    <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4 min-h-24 flex flex-col gap-1 items-center justify-center">
                        {teamB.length !== 0 ? teamB.map(user => (
                            <p key={user.uid} className="text-sm md:text-base">{user.name}</p>
                        )) :
                            <p className="text-2xl font-medium text-blue-600 mb-1">B팀</p>}
                    </div>
                </div>

                {/* 서브 순서 */}
                {isServeCount !== 0 && teamA.length > 0 && teamB.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        서브
                        <span className="font-medium text-gray-800">{currentServer}</span>
                    </div>
                )}

                {/* 점수판 */}
                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <button
                        onClick={() => addScore("A")} disabled={teamA.length === 0 || teamB.length === 0}
                        className="px-2 py-2 text-lg font-medium bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition disabled:opacity-30">
                        <Plus size={16} />
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <p className="text-sm text-gray-600">점수</p>
                        <p className="text-5xl font-medium text-gray-900">{aScore} : {bScore}</p>
                        <p className="text-lg text-gray-600">{aSetScore} : {bSetScore}</p>
                        <button
                            onClick={dormammu} disabled={history.length === 0}
                            className="mt-1 px-3 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition disabled:opacity-30">
                            되돌리기
                        </button>
                    </div>

                    <button
                        onClick={() => addScore("B")} disabled={teamA.length === 0 || teamB.length === 0}
                        className="px-2 py-2 text-lg font-medium bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl transition disabled:opacity-30" >
                        <Plus size={16} />
                    </button>
                </div>

                {/* 게임 설정 + 팀 선택 - 웹에서 병렬 */}
                <div className="md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-3">

                    {/* 게임 설정 */}
                    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                        <p className="text-sm font-medium text-gray-700">게임 설정</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">듀스</label>
                                <input type="checkbox" checked={isDeuce === 1}
                                    onChange={e => setIsDeuce(e.target.checked ? 1 : 0)}
                                    disabled={isGameStarted}
                                    className="w-4 h-4 accent-[#3182F6]" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">서브 순서</label>
                                <input type="checkbox" checked={isServeCount === 1}
                                    onChange={e => setIsServeCount(e.target.checked ? 1 : 0)}
                                    disabled={isGameStarted}
                                    className="w-4 h-4 accent-[#3182F6]" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">심판</label>
                                <select value={referee ?? ""}
                                    onChange={e => {
                                        const uid = e.target.value ? Number(e.target.value) : null;
                                        setReferee(uid);
                                        if (uid) {
                                            setTeamA(prev => prev.filter(u => u.uid !== uid));
                                            setTeamB(prev => prev.filter(u => u.uid !== uid));
                                        }
                                    }}
                                    disabled={isGameStarted}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3182F6] transition bg-white">
                                    <option value="">없음</option>
                                    {users?.map(user => (
                                        <option key={user.uid} value={user.uid}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">서브 시작</label>
                                <select value={serveStart}
                                    onChange={e => { setServeStart(e.target.value); setServeTeam(e.target.value); }}
                                    disabled={isCurrentSetStarted}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3182F6] transition bg-white">
                                    <option value="A">A팀</option>
                                    <option value="B">B팀</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">승리 점수</label>
                                <input type="number" min={5} value={targetScore}
                                    onChange={e => setTargetScore(Number(e.target.value))}
                                    disabled={isGameStarted}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3182F6] transition" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">경기 방식</label>
                                <select value={gameOption}
                                    onChange={e => setGameOption(e.target.value)}
                                    disabled={isGameStarted}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3182F6] transition bg-white">
                                    <option value="single">단판</option>
                                    <option value="Bo3">3판 2선</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 팀 선택 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <p className="text-sm font-medium text-gray-700 px-4 py-3 border-b border-gray-100">팀 선택</p>
                        {users?.filter(user => user.uid !== referee).map((user, i) => (
                            <div key={user.uid} className={`flex justify-between items-center px-4 py-3 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                                <span className="text-sm text-gray-800">{user.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => addToTeamA(user)}
                                        disabled={isGameStarted}
                                        className={`px-3 py-1 text-xs rounded-lg transition ${isInTeamA(user.uid) ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        A팀
                                    </button>
                                    <button onClick={() => addToTeamB(user)}
                                        disabled={isGameStarted}
                                        className={`px-3 py-1 text-xs rounded-lg transition ${isInTeamB(user.uid) ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        B팀
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    )
}