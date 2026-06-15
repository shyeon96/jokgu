import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../api/axios"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function VerifyCode() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const navigate = useNavigate();

    // 이메일 있나없나 조회
    const { mutate : goCheck, isPending } = useMutation({
        mutationFn: async () => {
            const response = await api.get('/users/searchemail', {params: {username}});
            return response.data.email;
        },
        onSuccess: (data) => {
            setEmail(data);
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } })
        }
    })

    // 인증 코드 보내기
    const { mutate: sendCode } = useMutation({
        mutationFn: async() => {
            const response = await api.post('/users/sendresetcode', {email})
            return response.data;
        },
        onSuccess: () => {
            toast.success("코드를 보냈습니다. 이메일을 확인해보세요", { style: { background: '#22c55e', color: 'white' } });
            setVisible(true);
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } });
        }
    })

    // 인증 코드 확인
    const { mutate: verifyCode } = useMutation({
        mutationFn: async() => {
            const response = await api.post('/users/verifycode', {username, email, code});
            return response.data;
        },
        onSuccess: (data) => {
            toast.success("인증이 완료되었습니다", { style: { background: '#22c55e', color: 'white' } });
            sessionStorage.setItem("token", data.token);
            navigate('/resetpassword', {replace: true});
        },
        onError: (error) => {
            toast.error(error.message, { style: { background: '#f43f5e', color: 'white' } });
        }
    })

    const handleSubmit = async () => { await goCheck(); }
    const handleVerify = async () => { await verifyCode();}

    return (
        <div className="min-h-dvh flex flex-col items-center p-4 md:p-8 md:py-20">
            <div className="w-full max-w-sm p-8 rounded-2xl border border-gray-100 bg-white">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">비밀번호 초기화</h2>
    
                <div className="bg-amber-50 rounded-lg px-4 py-3 mt-3 mb-6">
                    <p className="text-xs text-amber-700 leading-relaxed">
                        ⚠️ 이메일을 등록한 사용자만 초기화할 수 있습니다. 미등록 시 관리자에게 문의하세요.
                    </p>
                </div>
    
                <div className="flex flex-col gap-1 mb-4">
                    <label htmlFor="username" className="text-sm font-medium text-gray-600">로그인 아이디</label>
                    <input id="username" type="text" placeholder="가입할 때의 아이디" value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition" />
                </div>
                <button onClick={handleSubmit} disabled={isPending || !!email}
                    className="w-full bg-[#3182F6] hover:bg-[#2563eb] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition mb-4">
                    이메일 조회
                </button>
    
                {email && (
                    <>
                        <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                            <span className="text-sm text-gray-700 flex-1">{email}</span>
                        </div>
                        <button onClick={() => sendCode()}
                            className="w-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg transition mb-4">
                            인증코드 받기
                        </button>
                    </>
                )}
    
                {visible && (
                    <div className="flex flex-col gap-1">
                        <label htmlFor="code" className="text-sm font-medium text-gray-600">인증코드 입력</label>
                        <input id="code" type="text" placeholder="인증코드 8자리를 입력해주세요" value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#3182F6] transition mb-4" />
                        <button onClick={() => handleVerify()}
                            className="w-full bg-[#3182F6] hover:bg-[#2563eb] text-white font-semibold py-2.5 rounded-lg transition">
                            인증하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}