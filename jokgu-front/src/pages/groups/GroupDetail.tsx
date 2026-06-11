import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import api from '../../api/axios'
import type { pendingUser } from "../../types";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import Loading from "../Loading";

interface users {
    uid: number,
    name: string,
    role: string
}

interface plans {
    pid: number,
    planname: string,
    name: string,
    date: string
}

interface groupDetail {
    name: string,
    description: string,
    role: string,
    code: string
}

export default function GroupDetail() {
    const { gid } = useParams();
    const queryClient = useQueryClient();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        const close = () => setMenuOpen(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [])

    const { data: groupDetail, isLoading: groupDetailLoading } = useQuery({
        queryKey: ['groupDetail', gid],
        queryFn: async () => {
            const response = await api.get<groupDetail[]>(`/groups/${gid}`);
            return response.data[0];
        }
    });

    const [{ data: pendingList, isLoading: pendingLoading },
        { data: userList, isLoading: userLoading },
        { data: planList, isLoading: planLoading }] = useQueries({
            queries: [
                {
                    queryKey: ['pendingList', gid],
                    queryFn: async () => {
                        const response = await api.get<pendingUser[]>(`/groups/${gid}/pending`);
                        return response.data;
                    },
                    enabled: groupDetail?.role === "admin"
                },
                {
                    queryKey: ['userList', gid],
                    queryFn: async () => {
                        const response = await api.get<users[]>(`/groups/${gid}/userlist`);
                        return response.data;
                    }
                },
                {
                    queryKey: ['planList', gid],
                    queryFn: async () => {
                        const response = await api.get<plans[]>(`/groups/${gid}/planlist`);
                        return response.data;
                    }
                }
            ]
        })

    const pasteCode = () => {
        navigator.clipboard.writeText(groupDetail?.code ?? "");
        setMenuOpen(false);
        toast.success("초대 코드가 복사되었어요", { style: { background: '#22c55e', color: 'white' } })
    }
    const { mutate: handleApprove } = useMutation({
        mutationFn: ({ approve, ugid }: { approve: 0 | 1, ugid: number }) => api.put(`/groups/${gid}/approve`, { approve, ugid }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingList', gid] });
            queryClient.invalidateQueries({ queryKey: ['userList', gid] });
        },
        onError: (error) => {
            toast.error(error.message, {style: {background: '#f43f5e', color: 'white'}})
        }
    })

    const [showAllMembers, setShowAllMembers] = useState(false);

    const members: users[] = userList ?? [];
    const visibleMembers = showAllMembers ? members : members.slice(0, 5);

    const [editModal, setEditModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);

    const openEditModal = () => {
        setEditModal(true);
        setMenuOpen(false);
    }

    const openLeaveModal = () => {
        setLeaveModal(true);
        setMenuOpen(false);
    }

    return (
        <>
            <div className="p-2 md:p-4 space-y-6">
                <div className="relative rounded-2xl overflow-hidden mb-6">
                    <div className="h-32 md:h-44 bg-gradient-to-br from-[#3182F6] via-[#5b9fff] to-[#a8cbff] relative">
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                        {groupDetailLoading ? (<Loading />) : groupDetail ? (
                            <>
                                <div className="absolute bottom-5 left-5">
                                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                                        {groupDetail?.name}
                                    </h1>
                                </div>

                                <div className="absolute top-3 right-3 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                                        className="p-2 backdrop-blur-sm transition text-white cursor-pointer">
                                        <MoreHorizontal size={24} />
                                    </button>
                                    {menuOpen && (
                                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer" onClick={() => pasteCode()}>
                                                초대코드 복사
                                            </button>
                                            {groupDetail?.role === 'admin' ? (
                                                <button onClick={() => openEditModal()} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                                                    정보 수정
                                                </button>
                                            ) : (
                                                <button onClick={() => openLeaveModal()} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer">
                                                    모임 나가기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : <>
                            <div className="absolute bottom-5 left-5">
                                <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                                    
                                </h1>
                            </div>
                            <div className="absolute top-3 right-3 z-10">
                                <button
                                    className="p-2 backdrop-blur-sm transition text-white">
                                    <MoreHorizontal size={24} />
                                </button>
                            </div></>}
                    </div>

                    <div className="bg-white border border-slate-100 border-t-0 rounded-b-2xl px-5 py-4 min-h-16 md:min-h-24 flex items-start">
                        <p className="text-sm md:text-base text-black leading-relaxed whitespace-pre-wrap">
                            {groupDetail?.description ?? <span className="text-slate-300">소개글이 없습니다</span>}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="space-y-4">
                        {pendingLoading ? (<Loading />) : groupDetail?.role === 'admin' && pendingList && pendingList.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-slate-400 mb-2">
                                    가입 요청 <span className="text-blue-500">{pendingList.length}건</span>
                                </p>
                                <div className="bg-white border border-blue-100 rounded-xl overflow-hidden">
                                    {pendingList.map((user, i) => (
                                        <div key={user.ugid} className={`flex justify-between items-center px-4 py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-xs font-medium text-[#3182F6] shrink-0">
                                                    {user.name[0]}
                                                </div>
                                                <span className="text-sm text-gray-800">{user.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove({ approve: 1, ugid: user.ugid })}
                                                    className="px-3 py-1.5 text-xs font-medium bg-[#3182F6] hover:bg-blue-700 text-white rounded-lg transition">
                                                    승인
                                                </button>
                                                <button onClick={() => handleApprove({ approve: 0, ugid: user.ugid })}
                                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition">
                                                    거절
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-2">멤버 {members.length}명</p>
                            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                                {userLoading ? <Loading /> : userList && userList.length > 0 ? (
                                    <>
                                        {visibleMembers.map((user, i) => (
                                            <div key={user.uid} className={`flex justify-between items-center px-4 py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${user.role === 'admin' ? 'bg-[#EEF4FF] text-[#3182F6]' : 'bg-slate-100 text-slate-500'}`}>
                                                        {user.name[0]}
                                                    </div>
                                                    <span className="text-sm text-gray-800">{user.name}</span>
                                                </div>
                                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-[#EEF4FF] text-[#185FA5]' : 'bg-slate-100 text-slate-500'}`}>
                                                    {user.role === 'admin' ? '관리자' : '멤버'}
                                                </span>
                                            </div>
                                        ))}
                                        {members.length > 5 && (
                                            <button onClick={() => setShowAllMembers((v) => !v)}
                                                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition cursor-pointer">
                                                {showAllMembers ? '접기' : `${members.length - 5}명 더보기`}
                                            </button>
                                        )}
                                    </>
                                ) : <div className={"flex justify-between items-center px-4 py-3"}>존재하는 멤버가 없습니다</div>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-slate-500">활동 내역</p>
                            <Link to={`/groups/${gid}/create`} className="text-xs text-[#3182F6] hover:text-blue-700 transition">
                                + 추가
                            </Link>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                            {planLoading ? (<Loading />) : planList && planList.length > 0 ? (
                                planList.map((plan, i) => (
                                    <Link key={plan.pid} to={`/plans/${plan.pid}`}
                                        className={`group flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{plan.planname}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{plan.date.slice(0,10)}</p>
                                        </div>
                                        <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                                    </Link>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-slate-400">
                                    등록된 활동이 없습니다
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <EditGroupModal
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                gid={gid}
                initialName={groupDetail?.name ?? ''}
                initialDesc={groupDetail?.description ?? ''}
            />
            <LeaveGroupModal
                isOpen={leaveModal}
                onClose={() => setLeaveModal(false)}
                gid={gid}
            />
        </>
    )
}

function EditGroupModal({
    isOpen,
    onClose,
    gid,
    initialName,
    initialDesc
}: {
    isOpen: boolean;
    onClose: () => void;
    gid: string | undefined;
    initialName: string;
    initialDesc: string;
}) {
    const queryClient = useQueryClient();
    const [editName, setEditName] = useState(initialName);
    const [editDesc, setEditDesc] = useState(initialDesc);

    useEffect(() => {
        if (isOpen) {
            setEditName(initialName);
            setEditDesc(initialDesc);
        }
    }, [isOpen, initialName, initialDesc]);

    const { mutate: handleEdit } = useMutation({
        mutationFn: () => api.put(`/groups/${gid}/update`, { name: editName, description: editDesc }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groupDetail', gid] });
            onClose();
            toast.success("수정 완료", { style: { background: '#22c55e', color: 'white' } })
        },
        onError: (error: any) => {
            toast.error(error.message, {style: {background: '#f43f5e', color: 'white'}})
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-5 w-80 md:w-150 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-base font-semibold text-slate-800">모임 정보 수정</h2>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">모임 이름</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">소개</label>
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={8}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition resize-none" />
                </div>

                <div className="flex gap-2 pt-1">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                        취소
                    </button>
                    <button onClick={() => handleEdit()}
                        className="flex-1 py-2.5 text-sm bg-[#3182F6] hover:bg-blue-700 text-white rounded-xl transition font-medium cursor-pointer">
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}

function LeaveGroupModal({
    isOpen,
    onClose,
    gid
}: {
    isOpen: boolean;
    onClose: () => void;
    gid: string | undefined;
}) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate: leaveMutate } = useMutation({
        mutationFn: () => api.delete(`/groups/${gid}/leave`),
        onSuccess: () => {
            onClose();
            queryClient.invalidateQueries({ queryKey: ['userList', gid] });
            toast.success("모임에서 나갔어요", { style: { background: '#22c55e', color: 'white' } })
            navigate('/main', { replace: true })
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-5 w-80 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                <div>
                    <h2 className="text-base font-semibold text-slate-600">모임 나가기</h2>
                    <p className="text-sm text-slate-400 mt-1">탈퇴하면 다시 초대코드로 참가해야 합니다.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose}
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
    )
}