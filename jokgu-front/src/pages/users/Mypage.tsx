import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios";
import type { MyPage, PlanInfo } from "../../types";
import Loading from "../Loading";
import { Landmark, Mail, MapPin, MoreVertical, Phone, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Mypage() {

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [leaveModal, setLeaveModal] = useState<boolean>(false);
    const [showAll, setShowAll] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['MyPage'],
        queryFn: async () => {
            const response = await api.get<MyPage>("/users/mypage");
            return response.data;
        },
        select: (data) => ({
            ...data,
            winrate: data.winrate.map(g => ({
                ...g,
                win: Number(g.win) || 0,
                lose: Number(g.lose) || 0,
            }))
        })
    })

    const history: PlanInfo[] = data?.myplans ?? [];
    const visibleHistory = showAll ? history : history.slice(0, 5);

    const { register, handleSubmit, reset } = useForm();

    const { mutate: editMutate } = useMutation({
        mutationFn: async (data: FieldValues) => {
            await api.put("/users/update", data);
        },
        onSuccess: (_, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['MyPage'] })
            sessionStorage.setItem("user", variables.name)
            toast.success("수정 완료", { style: { background: '#22c55e', color: 'white' } });
            setEditModal(false);
            window.location.reload();
        },
        onError: () => {
            toast.error("수정을 할 수가 없어요", { style: { background: '#f43f5e', color: 'white' } })
        }
    });

    const { mutate: leaveMutate } = useMutation({
        mutationFn: async () => {
            await api.post("/users/deactivate");
        },
        onSuccess: () => {
            toast.success("로그인 화면으로 이동합니다", { style: { background: '#22c55e', color: 'white' } });
            sessionStorage.clear();
            navigate('/login', { replace: true })
        },
        onError: () => {
            toast.error("탈퇴중 오류가 발생했습니다.", { style: { background: '#f43f5e', color: 'white' } });
            window.location.reload();
        }
    })

    const openEditModal = () => {
        reset({
            name: data?.name,
            email: data?.email,
            address: data?.address,
            account: data?.account,
            phone: data?.phone,
        })
        setEditModal(true);
    }

    // 상위 4개 모임의 plan 합
    const totalCount = data?.groupRatio[0]?.totalCount ?? 0;
    const topTotal = data?.groupRatio.reduce((sum, x) => sum + x.count, 0) ?? 0;
    const etcCount = totalCount - topTotal;

    const chartData = etcCount > 0
        ? [...(data?.groupRatio ?? []), { gid: 0, gname: '기타', count: etcCount, totalCount: totalCount }]
        : data?.groupRatio ?? [];

    if (isLoading) return <Loading />
    if (!data) return <div className="w-full h-full flex items-center justify-center">데이터를 불러오지 못했습니다</div>

    return (
        <div className="p-4 md:py-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-medium text-gray-900">마이페이지</h1>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                <button onClick={() => { openEditModal(); setMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-t-xl transition cursor-pointer">
                                    개인정보 수정
                                </button>
                                <button onClick={() => { navigate("/pwd") }}
                                    className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-t-xl transition cursor-pointer">
                                    비밀번호 변경
                                </button>
                                <button onClick={() => { setLeaveModal(true); setMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 rounded-b-xl transition cursor-pointer">
                                    회원 탈퇴
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 수정 모달 */}
            {editModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditModal(false)}>
                    <div className="bg-white rounded-2xl p-5 w-80 md:w-96 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-semibold text-slate-800">내 정보 수정</h2>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit((d: FieldValues) => editMutate(d))} className="space-y-3">
                            {[
                                { label: '이름', name: 'name' },
                                { label: '이메일', name: 'email' },
                                { label: '주소', name: 'address' },
                                { label: '계좌', name: 'account' },
                                { label: '전화번호', name: 'phone' },
                            ].map((field) => (
                                <div key={field.name} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-slate-400">{field.label}</label>
                                    <input {...register(field.name)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition" />
                                </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={() => setEditModal(false)}
                                    className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition">
                                    취소
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 text-sm bg-[#3182F6] hover:bg-blue-700 text-white rounded-xl transition font-medium">
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {leaveModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setLeaveModal(false)}>
                    <div className="bg-white rounded-2xl p-5 w-80 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div>
                            <h2 className="text-base font-semibold text-slate-600">회원 탈퇴</h2>
                            <p className="text-sm text-slate-400 mt-1">탈퇴 후 계정을 복구하려면 <br /> 카톡으로 말해주세요</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setLeaveModal(false)}
                                className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition">
                                취소
                            </button>
                            <button onClick={() => leaveMutate()}
                                className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition font-medium">
                                탈퇴
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 내 정보 */}
            <div className="mb-6 flex flex-col md:grid md:grid-cols-2 md:gap-6 gap-6">
                <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-3">내 정보</h2>
                    <div className="border border-gray-300 rounded-xl px-4 md:max-w-sm">
                        {[
                            { icon: <User size={16} />, value: data.name },
                            { icon: <Mail size={16} />, value: data.email },
                            { icon: <MapPin size={16} />, value: data.address },
                            { icon: <Landmark size={16} />, value: data.account },
                            { icon: <Phone size={16} />, value: data.phone },
                        ].map((item, i, arr) => (
                            <div key={i} className={`flex items-center gap-2 py-3 text-sm text-gray-700 ${i !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                <span className="shrink-0 text-gray-500">{item.icon}</span>
                                <span>{item.value || '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {data.groupRatio.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                        <p className="text-sm">참여한 모임이 없어요</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-sm font-medium text-gray-500 mb-3">모임별 활동</h2>
                        <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                    가장 많이 참여한 모임
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {data.groupRatio[0].gname}
                                </span>
                            </div>

                            <div className="flex md:flex-row items-center gap-6">
                                <div className="w-30 h-30 flex-shrink-0">
                                    <Pie
                                        data={{
                                            labels: chartData.map(g => g.gname),
                                            datasets: [{
                                                data: chartData.map(g => g.count),
                                                backgroundColor: ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#cbd5e1'],
                                                borderWidth: 2,
                                                borderColor: '#fff',
                                            }]
                                        }}
                                        options={{
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    callbacks: {
                                                        label: (ctx) => `${ctx.label}: ${ctx.raw}회`
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    {chartData.map((g, i) => {
                                        const colors = ['#1d4ed8', '#0891b2', '#059669', '#d97706'];
                                        const total = chartData.reduce((sum, x) => sum + x.count, 0);
                                        const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
                                        return (
                                            <div key={g.gid} className="flex flex-wrap items-center gap-1">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: colors[i] ?? '#e2e8f0' }} />
                                                <span className="text-sm text-gray-700 truncate">{g.gname}</span>
                                                <span className="text-xs text-gray-400 w-16 text-right truncate">
                                                    {g.count}회·{pct}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 gap-6">
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">내 전적</h2>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-5 px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-600">
                            <span className="col-span-2">그룹</span>
                            <span className="text-center">승</span>
                            <span className="text-center">패</span>
                            <span className="text-end">승률</span>
                        </div>
                        {data.winrate.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-sm text-gray-500">기록이 없습니다</div>
                        ) : data.winrate.map((group, i) => (
                            <div key={group.gid} className={`grid grid-cols-5 px-4 py-3 items-center text-sm ${i !== 0 ? 'border-t border-gray-200' : ''}`}>
                                <span className="text-gray-900 col-span-2 truncate">{group.gname}</span>
                                <span className="text-center text-blue-500">{group.win}승</span>
                                <span className="text-center text-red-500">{group.lose}패</span>
                                <span className="text-end text-gray-600">
                                    {group.win + group.lose === 0 ? '-' : Math.round(group.win / (group.win + group.lose) * 100) + '%'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 지난 모임 */}
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">히스토리</h2>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                        <div className="overflow-auto">
                            {history.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-sm text-gray-500">지난 모임이 없습니다</div>
                            ) : visibleHistory.map((plan, i) => (
                                <Link to={`/plans/${plan.pid}`} key={plan.pid} className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? 'border-t border-gray-200' : ''} transition hover:bg-gray-50`}>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{plan.planname}</p>
                                        <p className="text-xs text-gray-500 mt-1">{plan.date.slice(0, 10)} · {plan.time.slice(0, 5)}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 shrink-0 ml-2">{plan.groupname}</span>
                                </Link>
                            ))}
                            {history.length > 5 && (
                                <button onClick={() => setShowAll((v) => !v)}
                                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition cursor-pointer">
                                    {showAll ? '접기' : `전체 기록보기`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}