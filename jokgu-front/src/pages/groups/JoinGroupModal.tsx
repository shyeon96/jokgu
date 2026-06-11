import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../api/axios";
import type { GroupModal } from "../../types";
import { toast } from "sonner";
import Loading from "../Loading";

export default function JoinGroupModal({ onClose }: { onClose: () => void }) {
    const [code, setCode] = useState<string>('');
    const [searchCode, setSearchCode] = useState<string>('');

    const { data, isError, isLoading:groupLoading, isFetching } = useQuery({
        queryKey: ['JoinGroupModal', searchCode],
        queryFn: async () => {
            const response = await api.get<GroupModal>(`/groups/join`, { params: { code: searchCode } });
            return response.data;
        },
        enabled: searchCode !== '',
        retry: false,
    });

    const { mutate } = useMutation({
        mutationFn: (gid: number) => api.post('/groups/join', { gid: gid }),
        onSuccess: () => {
            toast.success("가입요청 전송", {style: {background: '#22c55e', color: 'white'}});
            onClose();
        },
        onError: () => toast.error("다시 시도해주세요", {style: {background: '#f43f5e', color: 'white'}})
    });

    const handleSearch = () => {
        if (code.trim() === '') return;
        setSearchCode(code);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
        setSearchCode('');
    }

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-medium text-gray-800">그룹 참가</h2>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="초대코드 8자리 입력"
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isFetching}
                        className="px-4 py-2.5 text-sm bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-300 text-white rounded-lg transition cursor-pointer"
                    >
                        {isFetching ? '검색 중...' : '검색'}
                    </button>
                </div>

                {isError && (
                    <p className="text-sm text-[#f43f5e]">존재하지 않는 초대코드입니다.</p>
                )}

                {groupLoading? (<Loading />) : data && (
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl">
                        <span className="font-medium text-gray-800">{data.name}</span>
                        <button
                            onClick={() => mutate(data.gid)}
                            className="px-4 py-2 text-sm bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            disabled ={data.isJoin}
                        >
                            {data.isJoin ? '가입 됨' : "요청"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}