import { useMutation } from "@tanstack/react-query";
import { useState } from "react"
import { toast } from "sonner";
import api from '../../api/axios';
import Loading from "../Loading";
import { useNavigate } from "react-router-dom";

interface UpdatePwdForm {
    currentPwd: string
    newPwd: string
    checkPwd: string
}

export default function UpdatePwd() {
    const navigate = useNavigate();

    const [currentPwd, setCurrentPwd] = useState<string>('');
    const [newPwd, setNewPwd] = useState<string>('');
    const [checkPwd, setCheckPwd] = useState<string>('');

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: UpdatePwdForm) => {
            const response = await api.put('users/updatepwd', data);
            console.log(response.data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("비밀번호가 변경되었습니다 다시 로그인 해주세요", {style: {background: '#22c55e', color: 'white'}});
            sessionStorage.clear();
            navigate('/login', {replace: true})
        },
        onError: (error) => {
            toast.error(error.message, {style: {background: '#f43f5e', color: 'white'}})
        }
    })

    const validPwd = () => {
        if (newPwd.trim().length === 0 || checkPwd.trim().length === 0) {
            toast.error("새 비밀번호를 입력해주세요", {style: {background: '#f43f5e', color: 'white'}});
            return false;
        } else if (newPwd !== checkPwd) {
            toast.error("새 비밀번호가 일치하지 않습니다", {style: {background: '#f43f5e', color: 'white'}});
            return false;
        } else if (newPwd.length < 3 || newPwd.length > 30) {
            toast.error("비밀번호는 3자 이상 30자 이하입니다", {style: {background: '#f43f5e', color: 'white'}});
            return false;
        }
        return true;
    }
    const watchNewPwd = (pwd: string) => {
        if (pwd.length > 0 && (pwd.length > 30 || pwd.length < 3)) {
            return "비밀번호는 3자 이상 30자 이하입니다";
        }
    }

    return (
        <div className="flex items-center justify-center p-4 md:py-20">
            <form onSubmit={(e) => {
                    e.preventDefault();
                    if (validPwd()) { mutate({ currentPwd, newPwd, checkPwd }); }
                }}
                className="flex flex-col gap-4 w-full max-w-sm p-8 rounded-2xl" >
                <h1 className="text-2xl font-bold text-center text-gray-800">비밀번호 변경</h1>
    
                <div className="flex flex-col gap-1">
                    <label htmlFor="current" className="text-sm font-medium text-gray-600">
                        기존 비밀번호 입력
                    </label>
                    <input id="current" type="password" value={currentPwd} autoComplete="current-password" minLength={3} maxLength={30}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="기존 비밀번호를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition" />
                </div>
    
                <div className="flex flex-col gap-1">
                    <label htmlFor="new" className="text-sm font-medium text-gray-600">
                        새 비밀번호 입력
                    </label>
                    <input id="new" type="password" value={newPwd} autoComplete="new-password" minLength={3} maxLength={30}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="새 비밀번호를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition" />
                    {watchNewPwd(newPwd) && (
                        <p className="text-xs text-red-500">{watchNewPwd(newPwd)}</p>
                    )}
                </div>
    
                <div className="flex flex-col gap-1">
                    <label htmlFor="check" className="text-sm font-medium text-gray-600">
                        비밀번호 확인
                    </label>
                    <input id="check" type="password" value={checkPwd} autoComplete="new-password" minLength={3} maxLength={30}
                        onChange={(e) => setCheckPwd(e.target.value)}
                        placeholder="새 비밀번호를 한번 더 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition" />
                </div>
    
                <button type="submit" disabled={isPending}
                    className="bg-[#3182F6] hover:bg-[#2563eb] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer">
                    {isPending ? <Loading /> : '변경'}
                </button>
            </form>
        </div>
    )
}