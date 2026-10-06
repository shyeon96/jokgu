# 분석 항목

가장 급한 문제는 서버가 요청 body를 그대로 저장하고, 리소스 단위 권한을 검사하지 않는다는 점입니다. 이전 세션의 문제 표 45개 항목을 복원했습니다. 심각도는 당시 분류를 유지했습니다. 같은 원인을 묶은 표이므로 45개가 서로 독립적인 결함 수를 뜻하지는 않습니다.

**근거 수준:** 소스에서 확인한 제어 흐름과 과거 정적 분석을 기록합니다. 실행 재현은 하지 않았습니다. `조건부`는 DB 스키마, 드라이버 반환값 또는 배포 환경 확인이 필요한 항목입니다. `개선`은 요구사항에 따라 판단할 제안입니다. 소스 링크의 줄 번호는 `6ab9590` 기준입니다.

### Critical

| ID | 문제 | 위치 | 재현과 영향 |
| --- | --- | --- | --- |
| C01 | signup이 body를 그대로 펼쳐 save함 (mass assignment) | [users/users.service.ts:43](../jokgu-server/src/users/users.service.ts#L43) | 기존 id와 새로운 username, 유효한 필수값을 가입 body에 넣으면 기존 행을 갱신하는 save 경로에 도달합니다. 비밀번호 변경으로 계정 탈취 위험이 있으며 대상 계정이 관리자라면 그 권한도 영향을 받습니다. 실행 재현은 하지 않았습니다. |
| C02 | `PUT /groups/:gid/approve`에 인가 없음, gid도 무시 | [groups/groups.controller.ts:54](../jokgu-server/src/groups/groups.controller.ts#L54) | 로그인한 사용자가 다른 그룹의 ugid로 멤버십을 삭제하거나 role을 member로 변경할 수 있습니다. 자기 pending 요청도 승인할 수 있습니다. admin 승격 기능은 아닙니다. |

### High

| ID | 문제 | 위치 | 재현과 영향 |
| --- | --- | --- | --- |
| H01 | `DELETE /plans/:pid`에 인가 없음 | [plans/plans.controller.ts:28](../jokgu-server/src/plans/plans.controller.ts#L28) | 로그인한 비회원의 삭제 요청도 소유권 확인 없이 DB에 전달됩니다. 실제 삭제 성공은 FK와 연관 데이터 조건에 달려 있습니다. |
| H02 | `POST /groups/:gid/create`에 인가 없음 | [groups/groups.controller.ts:69](../jokgu-server/src/groups/groups.controller.ts#L69) | 로그인한 비회원이 다른 그룹의 일정 생성 경로를 호출하고 그룹 밖 사용자를 참가자로 지정할 수 있습니다. |
| H03 | `POST /plans/:pid/matches`에 인가와 팀 검증 없음 | [plans/plans.controller.ts:38](../jokgu-server/src/plans/plans.controller.ts#L38) | 승자와 팀을 클라이언트 값 그대로 저장해 다른 사용자의 패배와 벌금을 조작할 수 있습니다. |
| H04 | `POST /fields`도 body를 그대로 펼쳐 save함 | [fields/fields.service.ts:35](../jokgu-server/src/fields/fields.service.ts#L35) | body에 id를 넣으면 기존 경기장을 덮어씁니다. 그 경기장을 쓰는 다른 그룹 일정의 장소도 바뀝니다. |
| H05 | 일정 날짜가 하루 앞당겨질 위험 (조건부) | [app.module.ts:33](../jokgu-server/src/app.module.ts#L33), [pages/plans/ScheduledPlans.tsx:58](../jokgu-front/src/pages/plans/ScheduledPlans.tsx#L58) | raw SQL의 DATE가 JS Date로 반환되면 `+09:00` 자정이 UTC 전날로 직렬화됩니다. 이를 `slice(0, 10)`으로 표시하는 화면에 영향이 있습니다. 실제 DDL과 API 응답을 확인해야 합니다. |

### Medium

| ID | 문제 | 위치 | 재현과 영향 |
| --- | --- | --- | --- |
| M01 | 재설정 토큰과 로그인 토큰이 같은 형태 | [users/users.controller.ts:60](../jokgu-server/src/users/users.controller.ts#L60) | 일반 로그인 토큰만 있으면 현재 비밀번호 없이 `resetpassword`가 됩니다. 비밀번호를 바꿔도 기존 토큰이 계속 유효합니다. |
| M02 | 비인증 사용자 열거와 이메일 원문 노출 | [users/users.service.ts:139](../jokgu-server/src/users/users.service.ts#L139), [pages/users/VerifyCode.tsx:88](../jokgu-front/src/pages/users/VerifyCode.tsx#L88) | `searchemail`에 아이디만 넣으면 그 회원의 이메일 주소 전체가 나옵니다. |
| M03 | 인증 엔드포인트에 rate limit 없음 | [users/users.service.ts:142](../jokgu-server/src/users/users.service.ts#L142) | 애플리케이션에 반복 요청 제한이 없어 로그인 시도와 메일 발송을 반복할 수 있습니다. 새 코드 행을 계속 만들면 최신 행만 조회하는 검증이 이전 코드를 거부합니다. 외부 프록시와 메일 서비스의 제한은 미확인입니다. |
| M04 | 회원 탈퇴 API 누락 | [pages/users/Mypage.tsx:63](../jokgu-front/src/pages/users/Mypage.tsx#L63) | 프론트가 호출하는 `POST /users/deactivate`가 서버에 없어 탈퇴가 항상 실패합니다. |
| M05 | `PUT /groups/:gid/update`에 관리자 검사 없음 | [groups/groups.controller.ts:59](../jokgu-server/src/groups/groups.controller.ts#L59) | 로그인한 비회원도 그룹 이름과 소개를 바꿀 수 있습니다. |
| M06 | 그룹, 일정, 경기 조회 IDOR | [groups/groups.controller.ts:39](../jokgu-server/src/groups/groups.controller.ts#L39) | 로그인한 비회원도 개별 하위 조회 API로 멤버 목록, 대기자, 일정, 벌금, 경기 결과를 조회할 수 있습니다. `GET /groups/:gid` 자체는 uid 조건을 사용합니다. |
| M07 | `POST /groups/join`이 초대코드를 검증하지 않음 | [groups/groups.service.ts:53](../jokgu-server/src/groups/groups.service.ts#L53) | gid만으로 아무 그룹에나 가입 요청을 넣습니다. |
| M08 | 일정 생성에 트랜잭션과 참가자 검증 없음 | [plans/plans.service.ts:28](../jokgu-server/src/plans/plans.service.ts#L28), [pages/plans/PlanCreate.tsx:130](../jokgu-front/src/pages/plans/PlanCreate.tsx#L130) | `uid=false` 같은 비배열 값은 length 검사를 통과하고, 일정 저장 뒤 map 호출에서 실패합니다. 일정 저장이 성공했다면 참가자 없는 일정이 남습니다. UI 미선택 값은 브라우저 재현이 필요합니다. 그룹과 경기 생성도 다단계 저장을 하나의 트랜잭션으로 묶지 않습니다. |
| M09 | 런타임 DTO 검증 없음 | [main.ts:5](../jokgu-server/src/main.ts#L5) | `ValidationPipe`와 class-validator가 없어 잘못된 입력이 500으로 떨어지거나 그대로 저장됩니다. |
| M10 | WebSocket 점수 이벤트에 권한 검사 없음 | [websocket/score.gateway.ts:56](../jokgu-server/src/websocket/score.gateway.ts#L56) | 로그인한 누구나 아무 일정의 실시간 점수를 조작하거나 지웁니다. 게이트웨이는 연결 시 JWT만 확인하며 이벤트별 사용자 권한을 검사하지 않습니다. |
| M11 | WebSocket 점수 값을 검증하지 않고 캐시함 | [websocket/score.gateway.ts:58](../jokgu-server/src/websocket/score.gateway.ts#L58) | aScore 같은 렌더링 필드에 객체를 넣으면 시청 화면에서 React 렌더링 오류가 발생할 수 있습니다. 캐시에 TTL과 항목 수 제한이 없어 `matchEnd` 또는 재시작 전까지 남습니다. 임의 pid를 계속 추가하면 메모리가 증가합니다. |
| M12 | 실시간 경기 상태가 기록자 탭에만 있음 | [websocket/score.gateway.ts:37](../jokgu-server/src/websocket/score.gateway.ts#L37) | 브라우저 강제 종료나 연결 단절로 cleanup이 전송되지 않으면 캐시가 남습니다. 경기 추가 버튼이 막히고 기록자 화면은 캐시를 복구하지 않습니다. 직접 URL 접근까지 막는 것은 아닙니다. |
| M13 | 되돌리기와 세트 전환을 방송하지 않음 | [pages/matches/MatchCreate.tsx:179](../jokgu-front/src/pages/matches/MatchCreate.tsx#L179) | 시청자 점수가 다음 득점 전까지 기록자와 어긋납니다. 마지막 세트 결과는 끝까지 방송되지 않습니다. |
| M14 | 경기장 상세 응답 필드명 불일치 | [pages/fields/FieldDetail.tsx:62](../jokgu-front/src/pages/fields/FieldDetail.tsx#L62) | 화면은 `isIn`/`isRes`/`isPark`를 읽고 서버는 `is_indoor`/`is_reservable`/`is_parking`을 줍니다. 항상 야외, 자유 이용, 주차장 없음으로 표시됩니다. |
| M15 | 401 인터셉터가 로그인 실패에도 새로고침함 | [api/axios.ts:23](../jokgu-front/src/api/axios.ts#L23) | 비밀번호를 틀리면 오류 안내와 입력한 아이디가 사라집니다. |
| M16 | 점수 기록 로직 결함 | [pages/matches/MatchCreate.tsx:108](../jokgu-front/src/pages/matches/MatchCreate.tsx#L108) | 세트나 매치 포인트 오입력은 되돌릴 수 없습니다. 듀스를 끄고 승리 점수 칸을 비우면 0:0에서 A팀 승리로 끝납니다. |
| M17 | 경기 결과 저장에 중복 제출 방지 없음 | [pages/matches/MatchCreate.tsx:251](../jokgu-front/src/pages/matches/MatchCreate.tsx#L251) | 저장 중 버튼을 잠그지 않아 중복 요청이 가능합니다. 두 요청이 모두 성공하면 같은 경기의 패배와 벌금이 중복 반영됩니다. |

### Low

| ID | 문제 | 위치 | 영향 |
| --- | --- | --- | --- |
| L01 | 인증코드 1회용 검사가 동작하지 않음 | [users/users.repository.ts:64](../jokgu-server/src/users/users.repository.ts#L64) | 조회 쿼리가 `used`를 SELECT하지 않아, 만료 전까지 같은 코드로 토큰을 계속 발급받습니다. |
| L02 | `PUT /users/update`가 body를 그대로 저장함 | [users/users.service.ts:105](../jokgu-server/src/users/users.service.ts#L105) | 유효한 기존 JWT가 있으면 body의 password를 해시 없이 저장하거나 is_active를 변경할 수 있습니다. 이 경로를 사용하려면 인증 토큰이 필요합니다. |
| L03 | 이메일 식별과 동시 가입 처리 (조건부) | [users/users.service.ts:143](../jokgu-server/src/users/users.service.ts#L143) | 이메일 unique 선언이 없어 실제 DB도 중복을 허용하면 이메일 조회가 다른 계정을 선택할 수 있습니다. username 동시 가입 충돌은 서비스에서 500으로 변환합니다. |
| L04 | 인증코드 대소문자 입력 안내 (개선) | [users/users.service.ts:167](../jokgu-server/src/users/users.service.ts#L167) | 대문자로 발급한 코드를 소문자로 입력하면 실패합니다. 대소문자 무시가 요구사항인지는 확인이 필요합니다. |
| L05 | 타임존에 따라 결과가 달라지는 SQL (조건부) | [users/users.repository.ts:66](../jokgu-server/src/users/users.repository.ts#L66), [main/main.repository.ts:14](../jokgu-server/src/main/main.repository.ts#L14) | 앱이 저장한 시각과 DB `NOW()`/`CURDATE()`의 기준이 다르면 만료와 오늘 일정 필터가 어긋납니다. 오차의 방향과 크기는 실제 컬럼 타입과 DB 세션 타임존에 달려 있습니다. |
| L06 | 중복 멤버십 row (조건부) | [groups/groups.repository.ts:34](../jokgu-server/src/groups/groups.repository.ts#L34) | 서비스에 존재 검사가 없고 엔티티에 복합 unique 선언이 없습니다. 실제 DB에도 제약이 없으면 반복 요청으로 중복됩니다. |
| L07 | 일정 삭제 시 연관 데이터 처리 없음 (조건부) | [plans/plans.service.ts:61](../jokgu-server/src/plans/plans.service.ts#L61) | userplan, matches, usermatch 처리가 FK 동작에 달려 있습니다. |
| L08 | 관리자 탈퇴 허용 | [groups/groups.service.ts:98](../jokgu-server/src/groups/groups.service.ts#L98) | 관리자 없는 그룹이 생깁니다. |
| L09 | 경기장 등록 시 외부 API 오류 처리 없음 | [fields/fields.service.ts:34](../jokgu-server/src/fields/fields.service.ts#L34), [pages/fields/FieldCreate.tsx:22](../jokgu-front/src/pages/fields/FieldCreate.tsx#L22) | 지오코딩 결과가 0건이면 addresses[0] 구조 분해에서 실패합니다. 실제 DB의 이름 unique 제약에 충돌하는 경우도 별도 오류 처리 없이 실패합니다. |
| L10 | 기록 화면을 벗어날 때마다 matchEnd 방송 | [pages/matches/MatchCreate.tsx:125](../jokgu-front/src/pages/matches/MatchCreate.tsx#L125) | 같은 일정에서 진행 중인 다른 경기를 끊고, 저장 직후 "경기를 취소하였습니다" 토스트가 뜹니다. |
| L11 | 조회 실패를 "데이터 없음"으로 표시 | [pages/Main.tsx:118](../jokgu-front/src/pages/Main.tsx#L118) | 서버 장애가 나도 "오늘은 일정이 없어요"로 보여 장애를 숨깁니다. 소켓 인증 실패도 표시하지 않습니다. |
| L12 | ResetPassword가 서버 오류를 버림 | [pages/users/ResetPassword.tsx:24](../jokgu-front/src/pages/users/ResetPassword.tsx#L24) | 원인 안내 없이 인증 단계부터 다시 하게 만듭니다. |
| L13 | 집계값의 문자열 반환 처리 (조건부) | [pages/users/Mypage.tsx:296](../jokgu-front/src/pages/users/Mypage.tsx#L296), [pages/plans/PlanDetail.tsx:269](../jokgu-front/src/pages/plans/PlanDetail.tsx#L269) | 집계값이 문자열이면 승률 분모의 +가 이어붙이기로 동작합니다. 예를 들어 win="10", lose="5"이면 10/105로 계산합니다. 문자열 금액의 toLocaleString()은 천 단위 구분을 추가하지 않습니다. |
| L14 | 네이버 지도 SDK 미로드 시 화면 오류 (조건부) | [pages/plans/PlanDetail.tsx:100](../jokgu-front/src/pages/plans/PlanDetail.tsx#L100) | 좌표가 있는 화면에서 SDK가 차단되면 naver 접근 중 오류가 납니다. 화면 복구 동작은 브라우저에서 확인해야 합니다. |
| L15 | env 검증 없음, JWT 설정 이중화 | [app.module.ts:20](../jokgu-server/src/app.module.ts#L20), [main.ts:14](../jokgu-server/src/main.ts#L14), [websocket/score.gateway.ts:5](../jokgu-server/src/websocket/score.gateway.ts#L5) | 필수 환경 변수 검증이 없습니다. 누락 시 CORS, 포트, 부팅 동작은 실제 런타임 확인이 필요합니다. ScoreModule은 import 시점의 env와 직접 선언하지 않은 dotenv 의존성에 기댑니다. |
| L16 | 도메인 테스트와 CI 부족 | [test/app.e2e-spec.ts:19](../jokgu-server/test/app.e2e-spec.ts#L19) | src 아래 단위 spec은 없고 e2e 1개는 현재 등록되지 않은 루트의 Hello World! 응답을 기대합니다. 저장소에 CI workflow가 없습니다. 테스트 실행 결과는 미확인입니다. |
| L17 | DB 스키마가 저장소에 없음 | [app.module.ts:32](../jokgu-server/src/app.module.ts#L32) | `synchronize:false`인데 DDL과 migration이 없습니다. users.is_active의 default도 엔티티에 없어 실제 스키마와 비교하지 않고 재생성하면 가입 동작이 달라질 수 있습니다. |
| L18 | 배포 전제가 저장소에 없음 | [websocket/score.gateway.ts:20](../jokgu-server/src/websocket/score.gateway.ts#L20) | Node 실행 버전 고정과 배포 구성이 저장소에 없습니다. 점수 캐시는 프로세스 메모리에 있고 인스턴스 간 공유 설정이 없습니다. 실제 운영 토폴로지는 미확인입니다. |
| L19 | 경기 결과 저장 멱등성 없음 (서버 측) | [matches/matches.service.ts:21](../jokgu-server/src/matches/matches.service.ts#L21) | 같은 요청을 두 번 받으면 경기가 2건 생깁니다. |
| L20 | 데드 코드와 쓰지 않는 의존성 | [app.module.ts:42](../jokgu-server/src/app.module.ts#L42), [vite.config.ts:40](../jokgu-front/vite.config.ts#L40) | 빈 usergroup/userplan/usermatch 서비스와 컨트롤러, 직접 사용하지 않는 `@nestjs/axios`, 설치되지 않은 recharts를 참조하는 optimizeDeps 설정을 정리할 후보로 봅니다. |
| L21 | 10.4 MB TTF 폰트 전역 사용 (개선) | [index.css:5](../jokgu-front/src/index.css#L5) | 폰트 파일은 10,400,436바이트이며 전역 CSS에서 사용합니다. 현 precache glob에는 ttf가 없습니다. 실제 전송량과 초기 로딩 시간은 측정하지 않았습니다. |

## 재현 전에 확인할 조건

- C01은 테스트 계정의 기존 id, 사용하지 않는 username, 유효한 필수 필드를 가진 입력을 전제로 합니다. 기존 행과 비밀번호가 바뀌는지는 격리 DB에서 확인합니다.
- H04는 유효한 주소로 지오코딩이 성공해야 save 경로에 도달합니다.
- H01은 인가 누락 자체와 실제 삭제 성공을 구분합니다. 연관 행이 있는 경우 FK 정책에 따라 삭제가 실패할 수 있습니다.
- M17과 L19는 같은 중복 저장 문제의 프론트와 서버 측 원인입니다. 같은 요청이 성공한 횟수와 정산 결과를 함께 확인합니다.
- C02는 admin 권한 부여가 아닙니다. pending 승인, 기존 멤버십 삭제, admin 행을 member로 변경하는 위험입니다.

[문서 안내](README.md) / [구조](architecture.md) / [수정 순서와 검증 한계](remediation.md)
