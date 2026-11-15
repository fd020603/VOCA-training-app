export interface AutocompleteVocabEntry {
  word: string;
  partOfSpeech: string;
  meaning: string;
  fromHistory?: boolean;
}

/**
 * Compact built-in TOEIC & Business English core vocabulary (~1,500 entries).
 * Format: "word|pos|korean_meaning"
 */
const RAW_TOEIC_VOCAB = `
abandon|v.|버리다, 포기하다
abbreviate|v.|축약하다, 줄이다
abide|v.|지키다, 준수하다
ability|n.|능력, 역량
abnormal|adj.|비정상적인
abolish|v.|폐지하다
abound|v.|풍부하다, 많다
abroad|adv.|해외로, 해외에
abrupt|adj.|갑작스러운, 퉁명스러운
absence|n.|부재, 결근
absent|adj.|결석한, 부재중인
absolute|adj.|절대적인, 완전한
absorb|v.|흡수하다, 병합하다
abstract|adj.|추상적인
abundant|adj.|풍부한, 많은
abuse|n.|남용, 오용
academic|adj.|학문의, 학구적인
accelerate|v.|가속화하다, 촉진하다
accept|v.|수락하다, 받아들이다
acceptable|adj.|받아들일 수 있는, 만족스러운
acceptance|n.|수락, 승인
access|n.|접근, 이용 권한
accessible|adj.|접근 가능한, 이용하기 쉬운
accessory|n.|부속품, 액세서리
accident|n.|사고, 우연
acclaim|v.|칭송하다, 환호하다
accommodate|v.|수용하다, 편의를 도모하다
accommodation|n.|숙박 시설, 편의
accompany|v.|동반하다, 수반하다
accomplish|v.|성취하다, 완수하다
accomplishment|n.|업적, 성취
accord|n.|합의, 일치
accordance|n.|일치, 조화
according|prep.|~에 따라
account|n.|계좌, 설명, 거래처
accountable|adj.|책임이 있는
accountant|n.|회계사
accounting|n.|회계, 회계학
accredit|v.|공인하다, 인가하다
accumulate|v.|축적하다, 모으다
accuracy|n.|정확성, 정밀도
accurate|adj.|정확한, 정밀한
accuse|v.|고발하다, 비난하다
accustom|v.|익숙하게 하다
achieve|v.|달성하다, 성취하다
achievement|n.|성취, 업적
acknowledge|v.|인정하다, 수령을 알리다
acknowledgment|n.|인정, 감사, 수령 통지
acquaint|v.|알게 하다, 숙지시키다
acquaintance|n.|지인, 면식
acquire|v.|인수하다, 습득하다
acquisition|n.|인수, 습득
activate|v.|활성화하다, 작동시키다
active|adj.|활동적인, 적극적인
actual|adj.|실제의, 현실의
actuality|n.|현실, 실제
adapt|v.|적응하다, 개조하다
adaptable|adj.|적응성 있는
adaptation|n.|적응, 각색
add|v.|추가하다, 더하다
addict|v.|중독되게 하다
addition|n.|추가, 부가
additional|adj.|추가의, 부가적인
address|v.|다루다, 연설하다
adequate|adj.|적절한, 충분한
adhere|v.|고수하다, 부착하다
adherence|n.|준수, 고수
adjacent|adj.|인접한, 가까운
adjust|v.|조정하다, 적응하다
adjustment|n.|조정, 수정
administer|v.|관리하다, 집행하다
administration|n.|행정, 경영진, 관리
administrative|adj.|행정의, 관리상의
administrator|n.|관리자, 행정관
admire|v.|감탄하다, 존경하다
admission|n.|입장, 시인, 입학
admit|v.|인정하다, 입장을 허용하다
adopt|v.|채택하다, 입양하다
adoption|n.|채택, 도입
advance|v.|진전시키다, 선불하다
advanced|adj.|고급의, 선진의
advantage|n.|이점, 유리한 점
advantageous|adj.|유리한, 이로운
advent|n.|도래, 출현
adventure|n.|모험, 사업
adverse|adj.|불리한, 부정적인
adversity|n.|역경, 불운
advertise|v.|광고하다, 홍보하다
advertisement|n.|광고
advice|n.|조언, 충고
advisable|adj.|바람직한, 권할 만한
advise|v.|조언하다, 통지하다
adviser|n.|고문, 조언자
advocate|v.|옹호하다, 지지하다
aesthetic|adj.|미적인, 심미적인
affair|n.|일, 사안, 업무
affect|v.|영향을 미치다
affection|n.|애정, 호감
affiliate|n.|제휴사, 계열사
affirm|v.|단언하다, 확언하다
affirmative|adj.|긍정적인
affix|v.|붙이다, 첨부하다
affluent|adj.|부유한, 풍부한
afford|v.|여유가 있다, 제공하다
affordable|adj.|감당할 수 있는, 알맞은 가격의
agency|n.|대행사, 기관
agenda|n.|안건, 의제
agent|n.|대리인, 중개인
aggravate|v.|악화시키다
aggregate|n.|총계, 합계
aggressive|adj.|공격적인, 적극적인
agree|v.|동의하다, 합의하다
agreeable|adj.|기분 좋은, 동의할 수 있는
agreement|n.|합의, 계약서
agriculture|n.|농업
ahead|adv.|앞으로, 미리
aid|n.|지원, 원조
aim|n.|목표, 목적
airborne|adj.|비행 중인, 공중에 뜬
aircraft|n.|항공기
airfare|n.|항공 요금
airline|n.|항공사
aisle|n.|통로, 복도
alarm|n.|경보, 놀람
alert|adj.|기민한, 경계하는
alien|adj.|외국의, 이질적인
align|v.|일치시키다, 정렬하다
alike|adj.|비슷한, 흡사한
alive|adj.|살아 있는, 활기찬
allege|v.|주장하다, 혐의를 제기하다
allegiance|n.|충성, 충실
alleviate|v.|완화하다, 경감하다
alliance|n.|동맹, 제휴
allocate|v.|할당하다, 배분하다
allocation|n.|할당, 배분
allot|v.|할당하다, 배당하다
allow|v.|허용하다, 허락하다
allowance|n.|수당, 허용치
ally|n.|동맹국, 협력자
almost|adv.|거의
alone|adj.|혼자의, 단독의
alter|v.|바꾸다, 변경하다
alteration|n.|변경, 수정
alternate|v.|번갈아 하다
alternative|n.|대안, 선택지
altogether|adv.|완전히, 모두 합쳐
amateur|n.|아마추어, 비전문가
amaze|v.|놀라게 하다
ambassador|n.|대사, 사절
ambiguous|adj.|모호한, 애매한
ambition|n.|야망, 포부
ambitious|adj.|야심 찬, 의욕적인
amend|v.|수정하다, 개정하다
amendment|n.|수정, 개정안
amenity|n.|편의 시설
amid|prep.|~의 가운데에
amount|n.|총액, 수량
ample|adj.|충분한, 풍부한
amplify|v.|증폭시키다, 확대하다
amuse|v.|즐겁게 하다
analogous|adj.|유사한, 비슷한
analysis|n.|분석
analyst|n.|분석가
analyze|v.|분석하다
ancestor|n.|조상, 선조
anchor|n.|닻, 고정 장치
ancient|adj.|고대의, 오래된
anger|n.|분노, 화
angle|n.|각도, 관점
anniversary|n.|기념일
announce|v.|발표하다, 공고하다
announcement|n.|발표, 공고
annoy|v.|짜증나게 하다
annual|adj.|연례의, 매년의
annuity|n.|연금
anonymous|adj.|익명의
answer|n.|대답, 해답
antagonize|v.|반감을 사다, 적대시하다
anticipate|v.|예상하다, 기대하다
anticipation|n.|예상, 기대
antique|adj.|골동품의, 고풍스러운
anxiety|n.|불안, 염려
anxious|adj.|불안해하는, 열망하는
apologize|v.|사과하다
apology|n.|사과, 사죄
apparatus|n.|기구, 장치
apparent|adj.|분명한, 외관상의
appeal|v.|호소하다, 매력적이다
appear|v.|나타나다, ~처럼 보이다
appearance|n.|외모, 출현
appetite|n.|식욕, 욕구
applaud|v.|박수를 보내다, 칭찬하다
appliance|n.|가전제품, 기구
applicable|adj.|적용 가능한, 해당되는
applicant|n.|지원자, 신청자
application|n.|지원서, 신청, 응용 프로그램
apply|v.|지원하다, 적용하다
appoint|v.|임명하다, 지정하다
appointment|n.|약속, 임명
appraise|v.|평가하다, 감정하다
appreciate|v.|감사하다, 진가를 인정하다
appreciation|n.|감사, 평가, 가치 상승
apprehend|v.|체포하다, 이해하다
apprentice|n.|견습생, 수습생
approach|v.|접근하다, 다루다
appropriate|adj.|적절한, 알맞은
approval|n.|승인, 허가
approve|v.|승인하다, 찬성하다
approximate|adj.|대략의, 근사치의
aptitude|n.|적성, 소질
arbitrary|adj.|임의적인, 독단적인
arbitrate|v.|중재하다
architect|n.|건축가, 설계자
architecture|n.|건축, 구조
archive|n.|기록 보관소
arduous|adj.|힘든, 고된
area|n.|지역, 분야, 면적
argue|v.|주장하다, 논쟁하다
argument|n.|논쟁, 주장
arise|v.|발생하다, 일어나다
arm|n.|팔, 무기
arrange|v.|준비하다, 배열하다
arrangement|n.|준비, 합의, 배치
array|n.|배열, 집합
arrears|n.|연체금, 미불금
arrest|v.|체포하다, 저지하다
arrival|n.|도착
arrive|v.|도착하다
arrogant|adj.|오만한, 거만한
article|n.|기사, 조항, 물품
articulate|v.|명확히 표현하다
artificial|adj.|인공적인, 인조의
ascend|v.|오르다, 상승하다
ascertain|v.|확인하다, 규명하다
ascribe|v.|~의 탓으로 돌리다
aspect|n.|측면, 양상
aspire|v.|열망하다, 포부를 품다
assemble|v.|조립하다, 모으다
assembly|n.|조립, 회의, 의회
assert|v.|주장하다, 단언하다
assess|v.|평가하다, 산정하다
assessment|n.|평가, 심사
asset|n.|자산, 재산
assign|v.|배정하다, 할당하다
assignment|n.|과제, 배정
assimilate|v.|동화하다, 흡수하다
assist|v.|돕다, 지원하다
assistance|n.|도움, 지원
assistant|n.|조수, 보조원
associate|v.|연상하다, 제휴하다
association|n.|협회, 연합, 관련
assorted|adj.|다양한, 모듬의
assume|v.|추정하다, 맡다
assumption|n.|가정, 인수
assurance|n.|보장, 확신
assure|v.|보장하다, 확신시키다
astonish|v.|깜짝 놀라게 하다
astute|adj.|기민한, 통찰력 있는
attach|v.|첨부하다, 붙이다
attachment|n.|첨부 파일, 애착
attack|v.|공격하다
attain|v.|달성하다, 이르다
attempt|v.|시도하다
attend|v.|참석하다, 돌보다
attendance|n.|출석, 참석자 수
attendant|n.|안내원, 수행원
attention|n.|주의, 관심
attentive|adj.|주의 깊은, 세심한
attire|n.|복장, 의복
attitude|n.|태도, 자세
attorney|n.|변호사
attract|v.|끌어당기다, 유치하다
attraction|n.|매력, 명소
attractive|adj.|매력적인
attribute|v.|~의 덕분/탓으로 돌리다
auction|n.|경매
audience|n.|청중, 관객, 독자층
audio|adj.|오디오의, 음성의
audit|n.|회계 감사, 심사
audition|n.|오디션, 시연
auditorium|n.|강당
augment|v.|증가시키다, 늘리다
authentic|adj.|진짜의, 진품의
author|n.|저자, 작가
authority|n.|권한, 당국
authorize|v.|인가하다, 권한을 부여하다
auto|n.|자동차
automate|v.|자동화하다
automatic|adj.|자동의
automobile|n.|자동차
autonomous|adj.|자율적인, 자치의
avail|v.|도움이 되다, 이용하다
available|adj.|이용 가능한, 시간이 있는
avenue|n.|대로, 방안
average|n.|평균
avert|v.|피하다, 막다
aviation|n.|항공, 비행
avoid|v.|피하다, 방지하다
await|v.|기다리다
awake|adj.|깨어 있는
award|n.|상, 수여
aware|adj.|알고 있는, 인식하는
awareness|n.|인식, 의식
awesome|adj.|굉장한, 경외감을 주는
awkward|adj.|어색한, 서투른
backdrop|n.|배경
backfire|v.|역효과를 내다
background|n.|배경, 경력
backlog|n.|미처리 업무, 적체
backup|n.|백업, 지원
backward|adv.|뒤로, 거꾸로
badge|n.|배지, 신분증
baffle|v.|당황하게 하다
baggage|n.|수하물
bail|n.|보석금, 구제
balance|n.|균형, 잔액
ban|v.|금지하다
band|n.|밴드, 띠, 무리
bankrupt|adj.|파산한
bankruptcy|n.|파산
banner|n.|현수막, 배너
banquet|n.|연회, 만찬
bar|n.|막대, 술집, 장벽
bare|adj.|벌거벗은, 최소한의
barely|adv.|거의 ~않다, 간신히
bargain|n.|특가품, 흥정
barrier|n.|장벽, 장애물
base|n.|기초, 본부
basic|adj.|기본적인
basis|n.|근거, 기준
batch|n.|묶음, 일괄 처리
battery|n.|배터리, 건전지
bear|v.|견디다, 짊어지다
bearing|n.|관계, 태도, 방향
beat|v.|이기다, 두드리다
become|v.|~이 되다, 어울리다
behalf|n.|이익, 대표
behave|v.|행동하다
behavior|n.|행동, 행실
behind|prep.|~뒤에, 뒤처진
belief|n.|믿음, 신념
believe|v.|믿다
belong|v.|속하다
beloved|adj.|사랑받는
below|prep.|~아래에
benchmark|n.|기준점, 벤치마크
beneath|prep.|~바로 아래에
beneficial|adj.|유익한, 이로운
beneficiary|n.|수혜자, 수익자
benefit|n.|혜택, 이익, 복리후생
benevolent|adj.|자비로운, 호의적인
bet|v.|내기하다, 확신하다
betray|v.|배신하다, 드러내다
better|adj.|더 나은
beverage|n.|음료
beware|v.|조심하다, 주의하다
bias|n.|편견, 편향
bid|n.|입찰, 호가
bill|n.|청구서, 지폐, 법안
bind|v.|묶다, 구속하다
biography|n.|전기, 일대기
biotech|n.|생명공학
bitter|adj.|쓴, 쓰라린
blame|v.|비난하다, ~탓으로 돌리다
blank|adj.|빈, 공백의
blanket|n.|담요, 포괄적인
blast|n.|폭발, 돌풍
blend|v.|섞다, 혼합하다
bless|v.|축복하다
blind|adj.|눈이 먼, 맹목적인
block|v.|막다, 차단하다
bloom|v.|꽃이 피다, 번성하다
blueprint|n.|청사진, 설계도
blunder|n.|큰 실수
blunt|adj.|무딘, 직설적인
blur|v.|흐리게 하다
board|n.|이사회, 판, 탑승하다
boast|v.|자랑하다, 보유하다
bold|adj.|대담한, 굵은
bolster|v.|강화하다, 북돋우다
bond|n.|채권, 유대, 결속
bonus|n.|보너스, 상여금
book|v.|예약하다
bookkeeping|n.|부기, 회계 기장
boom|n.|호황, 붐
boost|v.|신장시키다, 밀어 올리다
booth|n.|부스, 매점
border|n.|국경, 경계
bore|v.|지루하게 하다, 구멍을 뚫다
borrow|v.|빌리다
boss|n.|상사, 사장
bother|v.|귀찮게 하다, 신경 쓰다
bottleneck|n.|병목 현상
bottom|n.|바닥, 맨 아래
bounce|v.|튀어 오르다, 반송되다
bound|adj.|~행의, ~할 의무가 있는
boundary|n.|경계, 한계
bow|v.|절하다, 숙이다
boycott|v.|불매 운동하다
branch|n.|지점, 지사, 나뭇가지
brand|n.|브랜드, 상표
breach|n.|위반, 침해
break|v.|깨다, 휴식하다
breakdown|n.|고장, 붕괴, 세부 내역
breakthrough|n.|획기적 발전, 돌파구
breed|v.|기르다, 야기하다
breeze|n.|산들바람
brief|adj.|짧은, 간결한
briefing|n.|브리핑, 요약 보고
briefly|adv.|잠시, 간단히
bright|adj.|밝은, 영리한
brilliant|adj.|훌륭한, 빛나는
bring|v.|가져오다, 야기하다
brisk|adj.|활발한, 상쾌한
broad|adj.|넓은, 광범위한
broadcast|v.|방송하다
brochure|n.|안내 책자, 브로셔
broker|n.|중개인, 브로커
browse|v.|둘러보다, 검색하다
budget|n.|예산
buffer|n.|완충 장치
build|v.|짓다, 구축하다
builder|n.|건축업자, 제작자
bulk|n.|대량, 대부분
bulletin|n.|게시, 회보
bump|v.|부딪히다, 올리다
bundle|n.|묶음, 꾸러미
burden|n.|부담, 짐
bureau|n.|국, 처, 사무국
bureaucracy|n.|관료제
burn|v.|타다, 태우다
burst|v.|터지다, 폭발하다
bury|v.|묻다, 파묻다
business|n.|사업, 업무, 기업
bustle|v.|북적이다, 분주하다
busy|adj.|바쁜
buy|v.|사다, 구매하다
buyer|n.|구매자, 바이어
bypass|v.|우회하다, 건너뛰다
cabin|n.|객실, 오두막
cabinet|n.|내각, 수납장
cable|n.|케이블, 전선
cafeteria|n.|구내식당
calculate|v.|계산하다, 산출하다
calculation|n.|계산, 추정
calendar|n.|달력, 일정표
call|v.|부르다, 전화하다
calm|adj.|차분한, 고요한
campaign|n.|캠페인, 운동
cancel|v.|취소하다
cancellation|n.|취소, 해약
candidate|n.|후보자, 지원자
capable|adj.|유능한, ~할 수 있는
capacity|n.|수용력, 능력, 용량
capital|n.|자본, 수도
capitalize|v.|자본화하다, 활용하다
caption|n.|자막, 사진 설명
capture|v.|포착하다, 사로잡다
card|n.|카드, 명함
care|n.|돌봄, 주의
career|n.|경력, 직업
careful|adj.|조심스러운, 신중한
careless|adj.|부주의한
cargo|n.|화물
carpenter|n.|목수
carpet|n.|카펫, 양탄자
carriage|n.|운송, 객차
carrier|n.|운송업체, 항공사
carry|v.|운반하다, 취급하다
cart|n.|수레, 장바구니
case|n.|경우, 사례, 상자
cash|n.|현금
cashier|n.|출납원, 계산원
cast|v.|던지다, 배역을 정하다
casual|adj.|평상시의, 격의 없는
catalog|n.|카탈로그, 목록
catalyst|n.|촉매제
catastrophe|n.|대재앙, 참사
catch|v.|잡다, 포착하다
category|n.|범주, 카테고리
cater|v.|음식을 공급하다, 맞추다
cause|n.|원인, 대의명분
caution|n.|주의, 경고
cautious|adj.|신중한, 조심성 있는
cease|v.|중단하다, 그치다
ceiling|n.|천장, 상한선
celebrate|v.|축하하다, 기념하다
celebration|n.|축하, 기념 행사
celebrity|n.|유명 인사
cell|n.|세포, 휴대폰
cement|n.|시멘트, 결속시키다
censor|v.|검열하다
census|n.|인구 조사
center|n.|중심, 센터
central|adj.|중앙의, 핵심적인
century|n.|세기, 100년
ceremony|n.|의식, 기념식
certain|adj.|확실한, 특정한
certainly|adv.|확실히, 물론
certificate|n.|증명서, 자격증
certification|n.|인증, 증명
certify|v.|증명하다, 인증하다
chain|n.|체인, 연쇄
chair|n.|의자, 의장직을 맡다
chairman|n.|회장, 의장
challenge|n.|도전, 난제
chamber|n.|회의실, 상공회의소
champion|n.|챔피언, 옹호자
chance|n.|기회, 가능성
change|v.|바꾸다, 변화하다
channel|n.|채널, 경로
chaos|n.|혼돈, 무질서
chapter|n.|장, 지부
character|n.|성격, 특징, 문자
characteristic|n.|특징, 특성
charge|n.|요금, 책임, 청구하다
charity|n.|자선 단체
charm|n.|매력
chart|n.|도표, 차트
charter|n.|헌장, 전세 내다
chase|v.|뒤쫓다, 추구하다
cheap|adj.|값이 싼
check|v.|확인하다, 점검하다
checklist|n.|점검표
cheer|v.|응원하다, 환호하다
chef|n.|주방장, 요리사
chemical|adj.|화학의
cherish|v.|소중히 여기다
chief|adj.|최고의, 수석의
choice|n.|선택, 선택권
choose|v.|선택하다
chronic|adj.|만성적인
chronological|adj.|연대순의
circuit|n.|회로, 순회
circulate|v.|순환하다, 배포하다
circulation|n.|유통, 발행 부수, 순환
circumstance|n.|상황, 환경
cite|v.|인용하다, 언급하다
citizen|n.|시민
civil|adj.|시민의, 민간의
claim|v.|주장하다, 청구하다
clarify|v.|명확히 하다
clarity|n.|명확성, 명료함
clash|v.|충돌하다, 맞부딪히다
class|n.|수업, 등급, 계층
classic|adj.|고전적인, 일류의
classify|v.|분류하다, 구분하다
clause|n.|조항, 절
clean|adj.|깨끗한
clear|adj.|명확한, 맑은
clearance|n.|재고 정리, 허가
clerk|n.|사무원, 점원
clever|adj.|영리한, 재치 있는
click|v.|클릭하다
client|n.|고객, 의뢰인
climate|n.|기후, 분위기
climb|v.|오르다, 등반하다
clinic|n.|병원, 진료소
clip|v.|자르다, 끼우다
clock|n.|시계
close|v.|닫다, 마감하다
closed|adj.|닫힌, 폐쇄된
closet|n.|벽장
closure|n.|폐쇄, 마감
cloth|n.|천, 직물
clothing|n.|의류
cloud|n.|구름, 클라우드
clue|n.|단서, 실마리
cluster|n.|무리, 집단
coach|n.|코치, 지도하다
coalition|n.|연합, 연립
coarse|adj.|거친, 조잡한
coast|n.|해안
code|n.|코드, 규범, 암호
coexist|v.|공존하다
cognitive|adj.|인지의
coherent|adj.|일관성 있는, 조리 있는
coincide|v.|동시에 일어나다, 일치하다
collaborate|v.|협력하다, 협업하다
collaboration|n.|협력, 협업
collapse|v.|붕괴하다, 무너지다
colleague|n.|동료
collect|v.|수집하다, 징수하다
collection|n.|수집품, 수금
collective|adj.|집단적인, 공동의
college|n.|대학
collide|v.|충돌하다
collision|n.|충돌
colonial|adj.|식민지의
colony|n.|식민지, 집단
column|n.|칼럼, 기둥, 세로줄
combat|v.|싸우다, 방지하다
combination|n.|결합, 조합
combine|v.|결합하다, 겸하다
comfort|n.|편안함, 위로
comfortable|adj.|편안한
command|v.|명령하다, 지휘하다
commemorate|v.|기념하다
commence|v.|시작하다, 개시하다
commend|v.|칭찬하다, 추천하다
comment|n.|논평, 의견
commerce|n.|상업, 무역
commercial|adj.|상업적인
commission|n.|수수료, 위원회, 위임하다
commit|v.|전념하다, 약속하다, 저지르다
commitment|n.|헌신, 약속, 책무
committee|n.|위원회
commodity|n.|상품, 원자재
common|adj.|흔한, 공통의
communicate|v.|소통하다, 전달하다
communication|n.|의사소통, 통신
community|n.|지역 사회, 공동체
commute|v.|통근하다
compact|adj.|소형의, 빽빽한
companion|n.|동반자, 동료
company|n.|회사, 동반
comparable|adj.|비교할 만한, 필적하는
comparative|adj.|비교의, 상대적인
compare|v.|비교하다
compatible|adj.|호환되는, 양립 가능한
compel|v.|강요하다, 억지로 시키다
compensate|v.|보상하다, 보전하다
compensation|n.|보상금, 급여
compete|v.|경쟁하다
competent|adj.|유능한, 자격 있는
competition|n.|경쟁, 대회
competitive|adj.|경쟁력 있는, 경쟁적인
competitor|n.|경쟁자, 경쟁사
compile|v.|편집하다, 수집하다
complain|v.|불평하다, 항의하다
complaint|n.|불만, 항의, 민원
complement|v.|보완하다, 보충하다
complete|adj.|완전한, 완료하다
completion|n.|완료, 완성
complex|adj.|복잡한, 복합 단지
compliance|n.|준수, 이행
compliant|adj.|준수하는, 따르는
complicate|v.|복잡하게 하다
complicated|adj.|복잡한
compliment|n.|칭찬, 찬사
complimentary|adj.|무료의, 칭찬하는
comply|v.|준수하다, 따르다
component|n.|구성 요소, 부품
compose|v.|구성하다, 작곡하다
composition|n.|구성, 작문
compound|n.|혼합물, 복합체
comprehensive|adj.|포괄적인, 종합적인
comprise|v.|포함하다, ~로 구성되다
compromise|n.|타협, 절충
compute|v.|계산하다
computerize|v.|전산화하다
conceal|v.|숨기다, 감추다
concede|v.|인정하다, 양보하다
conceive|v.|상상하다, 구상하다
concentrate|v.|집중하다
concentration|n.|집중, 농도
concept|n.|개념, 구상
concern|n.|우려, 관심사, 관련되다
concerned|adj.|염려하는, 관련된
concerning|prep.|~에 관하여
concert|n.|연주회, 협력
concession|n.|양보, 할인, 매점
concise|adj.|간결한, 축약된
conclude|v.|결론짓다, 끝내다
conclusion|n.|결론, 종료
concrete|adj.|구체적인, 콘크리트
concurrent|adj.|동시에 발생하는
condemn|v.|비난하다, 선고하다
condense|v.|요약하다, 응축하다
condition|n.|조건, 상태
conditional|adj.|조건부의
conduct|v.|수행하다, 지휘하다
confer|v.|수여하다, 상의하다
conference|n.|회의, 학회
confess|v.|고백하다, 자백하다
confidence|n.|자신감, 신뢰
confident|adj.|자신 있는, 확신하는
confidential|adj.|기밀의, 비밀의
confine|v.|제한하다, 가두다
confirm|v.|확인하다, 확정하다
confirmation|n.|확인, 확정서
conflict|n.|갈등, 충돌
conform|v.|따르다, 순응하다
confront|v.|직면하다, 맞서다
confuse|v.|혼란스럽게 하다
confusion|n.|혼란, 혼동
congested|adj.|혼잡한
congratulate|v.|축하하다
congress|n.|의회, 총회
connect|v.|연결하다, 접속하다
connection|n.|연결, 인맥
conquer|v.|정복하다, 극복하다
conscience|n.|양심
conscious|adj.|의식하는, 자각하는
consecutive|adj.|연속적인
consensus|n.|합의, 의견 일치
consent|n.|동의, 승낙
consequence|n.|결과, 중요성
consequently|adv.|결과적으로, 따라서
conservation|n.|보존, 절약
conservative|adj.|보수적인
conserve|v.|아끼다, 보존하다
consider|v.|고려하다, 간주하다
considerable|adj.|상당한, 많은
considerate|adj.|사려 깊은, 배려하는
consideration|n.|고려, 숙고, 배려
consist|v.|~로 이루어져 있다
consistent|adj.|일관된, 일치하는
consolidate|v.|통합하다, 공고히 하다
consolidation|n.|통합, 합병
conspicuous|adj.|눈에 띄는, 현저한
constant|adj.|지속적인, 끊임없는
constitute|v.|구성하다, 제정하다
constitution|n.|헌법, 구성
constrain|v.|제한하다, 강요하다
constraint|n.|제약, 제한
construct|v.|건설하다, 구성하다
construction|n.|건설, 공사
constructive|adj.|건설적인
consult|v.|상담하다, 참고하다
consultant|n.|컨설턴트, 고문
consultation|n.|상담, 협의
consume|v.|소비하다, 소모하다
consumer|n.|소비자
consumption|n.|소비, 소비량
contact|n.|연락, 접촉
contain|v.|포함하다, 억누르다
container|n.|용기, 컨테이너
contaminate|v.|오염시키다
contemplate|v.|고려하다, 숙고하다
contemporary|adj.|현대의, 동시대의
contend|v.|주장하다, 경쟁하다
content|n.|내용물, 콘텐츠, 만족하는
contest|n.|대회, 경쟁
context|n.|문맥, 맥락, 상황
continent|n.|대륙
contingency|n.|우발 사태, 비상 계획
continual|adj.|계속되는, 빈번한
continue|v.|계속하다
continuous|adj.|연속적인, 끊임없는
contract|n.|계약, 계약서, 수축하다
contractor|n.|도급업자, 계약자
contradict|v.|모순되다, 반박하다
contrary|adj.|반대의
contrast|n.|대조, 대비
contribute|v.|기여하다, 기부하다
contribution|n.|기여, 공헌, 기부금
control|v.|통제하다, 관리하다
controversial|adj.|논란이 많은
controversy|n.|논란, 논쟁
convenience|n.|편의, 편리함
convenient|adj.|편리한
convention|n.|대회, 관습, 협약
conventional|adj.|전통적인, 관례적인
converge|v.|수렴하다, 모이다
conversation|n.|대화
convert|v.|전환하다, 개조하다
convey|v.|전달하다, 운반하다
convince|v.|납득시키다, 확신시키다
cook|v.|요리하다
cooperate|v.|협력하다, 협조하다
cooperation|n.|협력, 협조
cooperative|adj.|협력적인, 협동조합
coordinate|v.|조정하다, 조율하다
coordination|n.|조정, 협조
cope|v.|대처하다, 극복하다
copy|n.|사본, 복사하다
copyright|n.|저작권
core|n.|핵심
corner|n.|모퉁이, 모서리
corporate|adj.|기업의, 법인의
corporation|n.|기업, 법인
correct|adj.|올바른, 수정하다
correction|n.|수정, 교정
correlate|v.|상관관계를 가지다
correspond|v.|일치하다, 서신을 주고받다
correspondence|n.|서신 왕래, 일치
corridor|n.|복도, 통로
corrupt|adj.|부패한, 타락한
cost|n.|비용, 대가
costly|adj.|비싼, 대가가 큰
council|n.|의회, 협의회
counsel|n.|조언, 변호인단
count|v.|세다, 중요하다
counter|n.|계산대, 반박하다
counteract|v.|대응하다, 중화하다
counterpart|n.|상대방, 대응 관계에 있는 것
countless|adj.|셀 수 없이 많은
country|n.|나라, 시골
county|n.|군, 주
couple|n.|두어 개, 커플
coupon|n.|쿠폰, 할인권
courage|n.|용기
courier|n.|택배 기사, 특사
course|n.|강좌, 과정, 경로
court|n.|법원, 경기장
courtesy|n.|예의, 호의
cover|v.|다루다, 덮다, 비용을 충당하다
coverage|n.|보도, 보상 범위
craft|n.|공예, 기술, 공들여 만들다
crash|v.|충돌하다, 폭락하다
create|v.|창조하다, 만들어 내다
creation|n.|창조, 창작물
creative|adj.|창의적인
credential|n.|자격 증명, 신임장
credible|adj.|믿을 수 있는, 신뢰할 만한
credit|n.|신용, 학점, 공로
crew|n.|승무원, 작업반
crime|n.|범죄
crisis|n.|위기
criteria|n.|기준, 척도
critic|n.|비평가
critical|adj.|비판적인, 중대한
criticism|n.|비판, 비평
criticize|v.|비판하다, 비난하다
crop|n.|작물, 수확량
cross|v.|건너다, 교차하다
crowd|n.|군중, 인파
crucial|adj.|중대한, 결정적인
crude|adj.|가공하지 않은, 대충의
cruise|n.|유람선 여행
crush|v.|으깨다, 압도하다
crystal|n.|수정, 결정체
cultivate|v.|경작하다, 기르다
culture|n.|문화
cumulative|adj.|누적되는
curb|v.|억제하다, 제한하다
cure|v.|치료하다, 해결하다
curiosity|n.|호기심
curious|adj.|호기심이 많은
currency|n.|통화, 화폐
current|adj.|현재의, 통용되는
currently|adv.|현재, 지금
curriculum|n.|교육 과정
curtail|v.|축소하다, 삭감하다
curve|n.|곡선
custody|n.|보관, 양육권, 구금
custom|n.|관습, 맞춤의
customer|n.|고객
customs|n.|세관, 관세
cut|v.|자르다, 삭감하다
cutback|n.|삭감, 감축
cycle|n.|주기, 순환
daily|adj.|매일의, 일간의
damage|n.|피해, 손상
damp|adj.|축축한, 습기 찬
danger|n.|위험
dangerous|adj.|위험한
dare|v.|감히 ~하다
dark|adj.|어두운
data|n.|자료, 데이터
database|n.|데이터베이스
date|n.|날짜, 기일
dawn|n.|새벽, 시작
deadline|n.|마감 기한
deadlock|n.|교착 상태
deal|n.|거래, 처리하다
dealer|n.|판매업자, 딜러
debate|n.|토론, 논쟁
debt|n.|빚, 부채
decade|n.|10년
decay|v.|부패하다, 쇠퇴하다
deceive|v.|속이다
decent|adj.|괜찮은, 품위 있는
decide|v.|결정하다
decision|n.|결정, 판단
decisive|adj.|결정적인, 단호한
deck|n.|갑판, 층
declaration|n.|선언, 신고서
declare|v.|선언하다, 신고하다
decline|v.|거절하다, 감소하다
decorate|v.|장식하다
decoration|n.|장식
decrease|v.|감소하다, 줄이다
dedicate|v.|바치다, 전념하다
dedication|n.|헌신, 전념
deduct|v.|공제하다, 빼다
deduction|n.|공제, 추론
deed|n.|행동, 증서
deem|v.|간주하다, 여기다
deep|adj.|깊은
default|n.|채무 불이행, 기본값
defeat|v.|패배시키다, 물리치다
defect|n.|결함, 하자
defective|adj.|결함이 있는
defend|v.|방어하다, 변호하다
defense|n.|방어, 변호
defer|v.|미루다, 연기하다
deficiency|n.|결핍, 부족
deficit|n.|적자, 부족액
define|v.|정의하다, 규정하다
definite|adj.|명확한, 확실한
definitely|adv.|분명히, 틀림없이
definition|n.|정의, 선명도
defy|v.|거역하다, 무시하다
degree|n.|정도, 학위, 도
delay|v.|지연시키다, 미루다
delegate|v.|위임하다, 대표자
delete|v.|삭제하다
deliberate|adj.|고의의, 신중한
delicate|adj.|섬세한, 연약한
delicious|adj.|맛있는
delight|n.|기쁨, 즐거움
deliver|v.|배달하다, 연설하다
delivery|n.|배달, 인도, 강연
demand|n.|요구, 수요
demanding|adj.|힘든, 요구가 많은
demolish|v.|철거하다, 파괴하다
demonstrate|v.|입증하다, 시연하다
demonstration|n.|시연, 입증, 시위
denote|v.|나타내다, 의미하다
dense|adj.|밀집한, 짙은
deny|v.|부인하다, 거부하다
depart|v.|출발하다, 떠나다
department|n.|부서, 백화점 매장
departure|n.|출발, 이탈
depend|v.|의존하다, 달려 있다
dependable|adj.|신뢰할 수 있는
dependent|adj.|의존하는, 부양가족
depict|v.|묘사하다, 그리다
deplete|v.|고갈시키다
deploy|v.|배치하다, 전개하다
deposit|n.|예금, 보증금, 입금하다
depot|n.|창고, 차고
depreciate|v.|가치가 하락하다
depress|v.|우울하게 하다, 침체시키다
depression|n.|불황, 우울증
deprive|v.|박탈하다, 빼앗다
depth|n.|깊이
deputy|n.|대리인, 부대표
derive|v.|유래하다, 얻다
descend|v.|내려오다, 물려받다
describe|v.|묘사하다, 설명하다
description|n.|설명, 묘사
desert|n.|사막, 버리다
deserve|v.|~받을 만하다
design|n.|설계, 디자인
designate|v.|지정하다, 지명하다
desirable|adj.|바람직한
desire|n.|욕구, 바람
desk|n.|책상, 안내 데스크
despair|n.|절망
desperate|adj.|절박한, 필사적인
despite|prep.|~에도 불구하고
destination|n.|목적지, 행선지
destiny|n.|운명
destroy|v.|파괴하다
destruction|n.|파괴
detach|v.|분리하다, 떼다
detail|n.|세부 사항
detailed|adj.|상세한, 구체적인
detain|v.|구금하다, 지체시키다
detect|v.|감지하다, 발견하다
deter|v.|단념시키다, 막다
deteriorate|v.|악화되다
determine|v.|결정하다, 알아내다
detour|n.|우회로
devastate|v.|황폐화시키다
develop|v.|개발하다, 발전하다
developer|n.|개발자, 개발업자
development|n.|개발, 발전
deviate|v.|벗어나다, 일탈하다
device|n.|장치, 기기
devise|v.|고안하다, 창안하다
devote|v.|바치다, 헌신하다
diagnose|v.|진단하다
diagram|n.|도표, 도해
dial|v.|전화를 걸다, 다이얼
dialogue|n.|대화
dictate|v.|지시하다, 좌우하다
die|v.|죽다, 사라지다
diet|n.|식단, 다이어트
differ|v.|다르다, 의견을 달리하다
difference|n.|차이, 차이점
different|adj.|다른
difficult|adj.|어려운
difficulty|n.|어려움, 곤란
diffuse|v.|확산시키다, 퍼뜨리다
dig|v.|파다, 발굴하다
digest|v.|소화하다, 요약하다
digital|adj.|디지털의
dignity|n.|품위, 존엄
dilemma|n.|진퇴양난, 딜레마
diligent|adj.|근면한, 성실한
dilute|v.|희석하다, 약화시키다
dim|adj.|어두운, 희미한
dimension|n.|차원, 치수, 규모
diminish|v.|줄어들다, 감소하다
dine|v.|식사하다
dining|n.|식사
dinner|n.|저녁 식사
dip|v.|잠깐 담그다, 하락하다
diploma|n.|졸업장, 수료증
diplomat|n.|외교관
direct|adj.|직접적인, 지시하다
direction|n.|방향, 지시
directive|n.|지침, 명령
directly|adv.|직접, 곧바로
director|n.|이사, 감독, 책임자
directory|n.|안내 책자, 디렉토리
disable|v.|무력화하다, 장애를 입히다
disadvantage|n.|불이익, 단점
disagree|v.|의견이 다르다, 반대하다
disappear|v.|사라지다
disappoint|v.|실망시키다
disapproval|n.|반대, 불승인
disaster|n.|재난, 참사
discard|v.|버리다, 폐기하다
discern|v.|식별하다, 분별하다
discharge|v.|방출하다, 해고하다, 퇴원시키다
discipline|n.|규율, 훈련, 분야
disclose|v.|공개하다, 폭로하다
disclosure|n.|공개, 폭로, 공시
discomfort|n.|불편함
disconnect|v.|연결을 끊다
discount|n.|할인, 할인하다
discourage|v.|낙담시키다, 말리다
discover|v.|발견하다
discovery|n.|발견
discrepancy|n.|불일치, 차이
discretion|n.|재량, 신중함
discriminate|v.|차별하다, 구별하다
discuss|v.|논의하다, 토론하다
discussion|n.|논의, 토론
disease|n.|질병
disgrace|n.|수치, 불명예
disguise|v.|변장하다, 숨기다
disgust|n.|혐오감
dish|n.|접시, 요리
dismiss|v.|해고하다, 묵살하다
disorder|n.|무질서, 장애
dispatch|v.|파견하다, 발송하다
dispense|v.|분배하다, 조제하다
disperse|v.|흩어지다, 분산시키다
displace|v.|대체하다, 쫓아내다
display|v.|전시하다, 표시하다
displease|v.|불쾌하게 하다
disposal|n.|처분, 처리
dispose|v.|처분하다, 배치하다
dispute|n.|분쟁, 논쟁
disregard|v.|무시하다
disrupt|v.|방해하다, 혼란시키다
dissatisfy|v.|불만족스럽게 하다
disseminate|v.|전파하다, 보급하다
dissolve|v.|해산하다, 녹이다
distance|n.|거리
distant|adj.|먼, 냉담한
distinct|adj.|뚜렷한, 별개의
distinction|n.|구별, 탁월함
distinctive|adj.|독특한, 구별되는
distinguish|v.|구별하다, 두각을 나타내다
distort|v.|왜곡하다
distract|v.|산만하게 하다, 주의를 돌리다
distress|n.|고통, 곤경
distribute|v.|배포하다, 유통하다
distribution|n.|분배, 유통
distributor|n.|유통업체, 도매업자
district|n.|지역, 구역
disturb|v.|방해하다, 불안하게 하다
dive|v.|뛰어들다, 급락하다
diverse|adj.|다양한
diversify|v.|다양화하다, 다각화하다
diversity|n.|다양성
divert|v.|우회시키다, 돌리다
divide|v.|나누다, 분할하다
dividend|n.|배당금
division|n.|부서, 분할, 나눗셈
divorce|n.|이혼, 분리
dock|n.|부두, 선창
doctor|n.|의사, 박사
document|n.|문서, 서류
documentary|n.|다큐멘터리, 기록의
domain|n.|영역, 도메인
domestic|adj.|국내의, 가정의
dominant|adj.|지배적인, 우세한
dominate|v.|지배하다, 우위를 차지하다
donate|v.|기부하다, 기증하다
donation|n.|기부, 기부금
donor|n.|기부자, 기증자
door|n.|문
dose|n.|복용량, 1회분
double|adj.|두 배의
doubt|n.|의심, 의혹
doubtful|adj.|의심스러운
downtown|n.|시내, 도심
downturn|n.|하락세, 경기 침체
draft|n.|초안, 어음
drag|v.|끌다, 질질 끌다
drain|v.|배수하다, 고갈시키다
drama|n.|드라마, 극
dramatic|adj.|극적인, 급격한
drastic|adj.|과감한, 급격한
draw|v.|그리다, 끌다, 비기다
drawback|n.|결점, 단점
drawer|n.|서랍
dread|v.|두려워하다
dream|n.|꿈
dress|n.|옷, 정장
drift|v.|표류하다, 흘러가다
drill|n.|드릴, 훈련
drink|v.|마시다
drive|v.|운전하다, 추진하다
drop|v.|떨어뜨리다, 하락하다
drought|n.|가뭄
drown|v.|물에 빠지다
drug|n.|약, 마약
dry|adj.|건조한
dual|adj.|이중의, 두 부분의
due|adj.|만기가 된, ~예정인
dull|adj.|무딘, 지루한, 부진한
dump|v.|버리다, 덤핑하다
duplicate|v.|복제하다, 사본의
durable|adj.|내구성이 있는, 튼튼한
duration|n.|지속 기간
during|prep.|~동안
dust|n.|먼지
duty|n.|의무, 직무, 관세
dwell|v.|거주하다, 곰곰이 생각하다
dynamic|adj.|역동적인
eager|adj.|열망하는, 간절히 바라는
early|adj.|이른, 초기의
earn|v.|벌다, 얻다
earnest|adj.|진지한, 성실한
earnings|n.|수입, 수익
earth|n.|지구, 땅
ease|v.|완화하다, 덜다
easily|adv.|쉽게
easy|adj.|쉬운, 편안한
echo|v.|메아리치다, 되풀이하다
economic|adj.|경제의, 경제학의
economical|adj.|경제적인, 절약하는
economy|n.|경제, 절약
edge|n.|가장자리, 우위
edit|v.|편집하다, 수정하다
edition|n.|판, 호
editor|n.|편집자
editorial|n.|사설, 편집의
educate|v.|교육하다
education|n.|교육
effect|n.|효과, 영향, 결과
effective|adj.|효과적인, 유효한
efficiency|n.|효율성, 능률
efficient|adj.|효율적인, 능률적인
effort|n.|노력
either|pron.|둘 중 하나
elaborate|adj.|정교한, 상세히 설명하다
elapse|v.|(시간이) 흐르다, 경과하다
elastic|adj.|탄력적인, 신축성 있는
elder|adj.|연장자의
elect|v.|선출하다, 선택하다
election|n.|선거
electric|adj.|전기의
electronic|adj.|전자의
elegant|adj.|우아한, 세련된
element|n.|요소, 성분
elementary|adj.|기초의, 초등의
elevate|v.|올리다, 승격시키다
elevator|n.|승강기, 엘리베이터
eligible|adj.|자격이 있는, 적격의
eliminate|v.|제거하다, 없애다
elite|n.|엘리트, 정예
eloquent|adj.|웅변의, 설득력 있는
else|adv.|그 밖에, 다른
embark|v.|탑승하다, 착수하다
embarrass|v.|당황하게 하다
embassy|n.|대사관
embed|v.|끼워 넣다, 내장하다
embrace|v.|포용하다, 받아들이다
emerge|v.|나타나다, 부상하다
emergency|n.|비상사태, 응급
emit|v.|방출하다, 내뿜다
emotion|n.|감정
emotional|adj.|감정적인
emphasis|n.|강조, 중점
emphasize|v.|강조하다
empire|n.|제국
employ|v.|고용하다, 이용하다
employee|n.|직원, 종업원
employer|n.|고용주
employment|n.|고용, 취업
empower|v.|권한을 주다
empty|adj.|빈, 비어 있는
enable|v.|가능하게 하다
enact|v.|제정하다, 상연하다
enclose|v.|동봉하다, 둘러싸다
encounter|v.|마주치다, 직면하다
encourage|v.|장려하다, 격려하다
end|n.|끝, 목적
endanger|v.|위험에 빠뜨리다
endeavor|n.|노력, 시도
endorse|v.|지지하다, 승인하다, 배서하다
endow|v.|기부하다, 부여하다
endure|v.|견디다, 지속되다
enemy|n.|적
energetic|adj.|활기찬
energy|n.|에너지, 활력
enforce|v.|집행하다, 시행하다
enforcement|n.|집행, 시행
engage|v.|참여하다, 고용하다, 약혼하다
engagement|n.|약속, 참여, 약혼
engine|n.|엔진, 기관
engineer|n.|엔지니어, 기사
enhance|v.|향상시키다, 높이다
enhancement|n.|향상, 강화
enjoy|v.|즐기다, 누리다
enlarge|v.|확대하다, 확장하다
enlighten|v.|계몽하다, 일깨우다
enormous|adj.|거대한, 막대한
enough|adj.|충분한
enrich|v.|풍부하게 하다
enroll|v.|등록하다, 입학하다
enrollment|n.|등록, 등록자 수
ensure|v.|보장하다, 확실히 하다
enter|v.|들어가다, 입력하다
enterprise|n.|기업, 사업
entertain|v.|즐겁게 하다, 접대하다
entertainment|n.|오락, 접대
enthusiasm|n.|열정, 열의
enthusiastic|adj.|열정적인, 열성적인
entire|adj.|전체의, 온전한
entirely|adv.|완전히, 전적으로
entitle|v.|자격을 주다, 제목을 붙이다
entity|n.|실체, 독립체, 법인
entrance|n.|입구, 입장
entrepreneur|n.|기업가, 창업자
entry|n.|입장, 출품, 입력 항목
envelope|n.|봉투
environment|n.|환경
environmental|adj.|환경의
envision|v.|마음속에 그리다, 구상하다
envy|v.|부러워하다
episode|n.|사건, 에피소드
equal|adj.|동등한, 평등한
equip|v.|장비를 갖추다
equipment|n.|장비, 설비
equivalent|adj.|동등한, 상응하는
era|n.|시대
eradicate|v.|근절하다, 뿌리 뽑다
erase|v.|지우다
erect|v.|세우다, 건립하다
err|v.|실수하다
errand|n.|심부름, 볼일
error|n.|오류, 실수
escalate|v.|확대되다, 악화되다, 단계적으로 올리다
escape|v.|탈출하다, 벗어나다
escort|v.|호위하다, 안내하다
especially|adv.|특히
essential|adj.|필수적인, 본질적인
establish|v.|설립하다, 확립하다
establishment|n.|설립, 기관, 시설
estate|n.|부동산, 재산
estimate|v.|추정하다, 견적을 내다
eternal|adj.|영원한
ethical|adj.|윤리적인
ethics|n.|윤리, 도덕
evaluate|v.|평가하다
evaluation|n.|평가
evaporate|v.|증발하다, 사라지다
even|adv.|심지어, 평평한, 짝수의
evening|n.|저녁
event|n.|행사, 사건
eventually|adv.|결국, 마침내
ever|adv.|언젠가, 여태까지
every|det.|모든, 매~마다
evidence|n.|증거, 흔적
evident|adj.|분명한, 명백한
evil|adj.|사악한, 해로운
evoke|v.|불러일으키다
evolve|v.|진화하다, 발전하다
exact|adj.|정확한
exactly|adv.|정확히
exaggerate|v.|과장하다
exam|n.|시험, 검사
examination|n.|검사, 시험, 조사
examine|v.|조사하다, 검토하다
example|n.|예, 본보기
exceed|v.|초과하다, 넘어서다
excel|v.|뛰어나다, 능가하다
excellent|adj.|훌륭한, 우수한
except|prep.|~을 제외하고
exception|n.|예외
exceptional|adj.|예외적인, 뛰어난
excess|n.|초과, 과잉
excessive|adj.|과도한, 지나친
exchange|v.|교환하다, 환전하다
excite|v.|흥분시키다, 자극하다
exclude|v.|제외하다, 배제하다
exclusive|adj.|독점적인, 전용의
excuse|n.|변명, 용서하다
execute|v.|실행하다, 처형하다
execution|n.|실행, 집행
executive|n.|임원, 경영진의
exempt|adj.|면제된, 면제하다
exercise|n.|운동, 행사하다
exert|v.|발휘하다, 행사하다
exhaust|v.|지치게 하다, 고갈시키다
exhibit|v.|전시하다, 드러내다
exhibition|n.|전시회, 박람회
exist|v.|존재하다
existence|n.|존재
existing|adj.|기존의, 현행의
exit|n.|출구, 나가다
expand|v.|확장하다, 확대하다
expansion|n.|확장, 확대
expect|v.|예상하다, 기대하다
expectation|n.|기대, 예상
expedite|v.|신속히 처리하다, 촉진하다
expedition|n.|탐험, 원정
expel|v.|추방하다, 내쫓다
expend|v.|소비하다, 지출하다
expenditure|n.|지출, 비용
expense|n.|비용, 경비
expensive|adj.|비싼
experience|n.|경험, 체험
experiment|n.|실험
expert|n.|전문가
expertise|n.|전문 지식, 전문 기술
expire|v.|만료되다, 만기가 되다
explain|v.|설명하다
explanation|n.|설명, 해명
explicit|adj.|명확한, 노골적인
explode|v.|폭발하다, 급증하다
exploit|v.|이용하다, 착취하다
explore|v.|탐구하다, 탐험하다
explosion|n.|폭발, 급증
export|v.|수출하다, 수출품
expose|v.|노출시키다, 폭로하다
exposure|n.|노출, 폭로
express|v.|표현하다, 급행의
expression|n.|표현, 표정
extend|v.|연장하다, 넓히다
extension|n.|연장, 내선 번호
extensive|adj.|광범위한, 대규모의
extent|n.|정도, 범위
exterior|n.|외부, 외관
external|adj.|외부의, 대외적인
extinct|adj.|멸종된, 사라진
extra|adj.|추가의, 여분의
extract|v.|추출하다, 발췌하다
extraordinary|adj.|비범한, 놀라운
extreme|adj.|극단적인, 극도의
fabric|n.|직물, 천, 구조
fabricate|v.|제조하다, 날조하다
face|n.|얼굴, 직면하다
facilitate|v.|용이하게 하다, 촉진하다
facility|n.|시설, 설비, 편의
fact|n.|사실
factor|n.|요인, 요소
factory|n.|공장
faculty|n.|교수진, 능력
fade|v.|희미해지다, 바래다
fail|v.|실패하다, ~하지 못하다
failure|n.|실패, 고장
faint|adj.|희미한, 기절하다
fair|adj.|공정한, 박람회
fairly|adv.|상당히, 공정하게
faith|n.|신뢰, 신념
fake|adj.|가짜의, 모조품
fall|v.|떨어지다, 하락하다
false|adj.|거짓의, 잘못된
fame|n.|명성
familiar|adj.|익숙한, 친숙한
family|n.|가족, 계열
famous|adj.|유명한
fan|n.|선풍기, 팬
fancy|adj.|화려한, 고급의
fantastic|adj.|환상적인
far|adv.|멀리, 훨씬
fare|n.|요금, 운임
farm|n.|농장
fascinate|v.|매혹하다
fashion|n.|유행, 방식
fast|adj.|빠른
fasten|v.|매다, 고정하다
fatal|adj.|치명적인
fate|n.|운명
fatigue|n.|피로, 피곤
fault|n.|결함, 잘못
favor|n.|호의, 호감을 갖다
favorable|adj.|호의적인, 유리한
favorite|adj.|가장 좋아하는
fax|n.|팩스
fear|n.|두려움, 염려
feasible|adj.|실현 가능한, 실행 가능한
feast|n.|잔치, 축제
feat|n.|위업, 솜씨
feature|n.|특징, 특집으로 다루다
federal|adj.|연방의
fee|n.|수수료, 요금
feed|v.|먹이를 주다, 공급하다
feedback|n.|피드백, 의견
feel|v.|느끼다
fellow|n.|동료, 연구원
female|adj.|여성의
fence|n.|울타리
ferry|n.|여객선, 페리
fertile|adj.|비옥한, 풍부한
festival|n.|축제
fetch|v.|가져오다
fever|n.|열, 열기
few|adj.|거의 없는, 소수의
fiber|n.|섬유, 광섬유
fiction|n.|소설, 허구
field|n.|분야, 현장, 들판
fierce|adj.|치열한, 사나운
fight|v.|싸우다, 투쟁하다
figure|n.|수치, 인물, 생각하다
file|n.|파일, 서류, 제출하다
fill|v.|채우다, 충족시키다
filter|n.|여과기, 거르다
final|adj.|최종의, 마지막의
finalize|v.|마무리하다, 최종 확정하다
finance|n.|재무, 금융, 자금을 대다
financial|adj.|재정의, 금융의
find|v.|찾다, 발견하다
finding|n.|조사 결과, 발견
fine|adj.|좋은, 미세한, 벌금
finger|n.|손가락
finish|v.|끝내다, 마무리하다
fire|n.|불, 해고하다
firm|n.|회사, 단단한, 확고한
first|adj.|첫째의, 최초의
fiscal|adj.|회계의, 재정의
fit|v.|맞다, 적합한
fix|v.|고치다, 고정하다
fixture|n.|고정 설비, 비품
flag|n.|깃발, 표시하다
flatter|v.|아첨하다
flavor|n.|맛, 풍미
flaw|n.|결함, 흠
flee|v.|달아나다, 피하다
fleet|n.|함대, 차량 대열
flexible|adj.|유연한, 융통성 있는
flight|n.|비행, 항공편
flip|v.|뒤집다, 튕기다
float|v.|뜨다, 유통시키다
flock|n.|무리, 떼
flood|n.|홍수, 쇄도하다
floor|n.|바닥, 층
flourish|v.|번창하다, 번성하다
flow|n.|흐름, 흐르다
fluctuate|v.|변동하다, 오르내리다
fluctuation|n.|변동, 오르내림
fluent|adj.|유창한
fluid|n.|유체, 유동적인
focus|v.|집중하다, 초점
fold|v.|접다, 문을 닫다
folder|n.|폴더, 서류철
follow|v.|따르다, 준수하다
following|adj.|다음의, 그 뒤의
fond|adj.|좋아하는
food|n.|음식
fool|n.|바보, 속이다
foot|n.|발, 피트
forbid|v.|금지하다
force|n.|힘, 강요하다
forecast|n.|예측, 예보하다
foremost|adj.|가장 중요한, 선두의
foresee|v.|예견하다, 내다보다
forest|n.|숲
forever|adv.|영원히
forfeit|v.|몰수당하다, 상실하다
forge|v.|구축하다, 위조하다
forget|v.|잊다
forgive|v.|용서하다
fork|n.|포크, 갈림길
form|n.|형태, 양식, 형성하다
formal|adj.|공식적인, 격식을 차린
format|n.|형식, 체제
formation|n.|형성, 구조
former|adj.|이전의, 전자의
formula|n.|공식, 처방
formulate|v.|수립하다, 공식화하다
forth|adv.|앞으로, 밖으로
forthcoming|adj.|다가오는, 곧 있을
fortify|v.|강화하다, 요새화하다
fortune|n.|재산, 행운
forum|n.|포럼, 공개 토론회
forward|adv.|앞으로, 전달하다
foster|v.|육성하다, 촉진하다
found|v.|설립하다, 창립하다
foundation|n.|기초, 토대, 재단
founder|n.|설립자, 창업자
fraction|n.|일부, 분수
fragile|adj.|깨지기 쉬운, 취약한
fragment|n.|조각, 파편
frame|n.|틀, 뼈대, 구성하다
framework|n.|틀, 체제, 뼈대
franchise|n.|가맹점, 프랜차이즈
frank|adj.|솔직한
fraud|n.|사기, 부정행위
free|adj.|무료의, 자유로운
freedom|n.|자유
freeze|v.|얼다, 동결하다
freight|n.|화물, 화물 운송
frequency|n.|빈도, 주파수
frequent|adj.|빈번한, 잦은
frequently|adv.|자주, 빈번히
fresh|adj.|신선한, 새로운
friction|n.|마찰, 갈등
friend|n.|친구
friendly|adj.|친절한, 우호적인
frighten|v.|겁주다, 놀라게 하다
front|n.|앞면, 정면
frontier|n.|국경, 개척 분야
frown|v.|눈살을 찌푸리다
fruit|n.|과일, 결실
fruitful|adj.|결실이 있는, 유익한
frustrate|v.|좌절시키다, 방해하다
fuel|n.|연료, 부채질하다
fulfill|v.|이행하다, 충족하다
full|adj.|가득 찬, 완전한
fume|n.|연기, 가스
fun|n.|재미, 즐거움
function|n.|기능, 행사, 작동하다
functional|adj.|기능적인, 실용적인
fund|n.|자금, 기금, 자금을 대다
fundamental|adj.|근본적인, 기본적인
funeral|n.|장례식
funny|adj.|웃기는, 이상한
furnish|v.|비치하다, 제공하다
furniture|n.|가구
further|adj.|추가적인, 더 나아가
furthermore|adv.|게다가, 더욱이
fuse|v.|융합하다, 결합하다
fuss|n.|소란, 법석
future|n.|미래
gain|v.|얻다, 증가하다
gallery|n.|미술관, 화랑
gamble|v.|도박하다, 모험하다
gang|n.|무리, 일당
gap|n.|격차, 틈
garage|n.|차고, 정비소
garbage|n.|쓰레기
garden|n.|정원
garment|n.|의류, 옷
gas|n.|가스, 휘발유
gather|v.|모으다, 모이다
gauge|v.|측정하다, 가늠하다
gaze|v.|응시하다
gear|n.|장비, 기어, 맞추다
gender|n.|성별
gene|n.|유전자
general|adj.|일반적인, 전반적인
generally|adv.|일반적으로, 대개
generate|v.|생성하다, 발생시키다
generation|n.|세대, 발생
generous|adj.|관대한, 넉넉한
genius|n.|천재
genre|n.|장르, 유형
gentle|adj.|온화한, 부드러운
genuine|adj.|진짜의, 진심 어린
geography|n.|지리, 지리학
gesture|n.|몸짓, 제스처
giant|adj.|거대한
gift|n.|선물, 재능
gifted|adj.|재능 있는
glance|v.|흘낏 보다
glare|v.|노려보다, 눈부시게 빛나다
glass|n.|유리, 잔
glimpse|n.|언뜻 봄
global|adj.|세계적인, 전반적인
globe|n.|지구, 세계
glory|n.|영광
glove|n.|장갑
glow|v.|빛나다, 홍조를 띠다
glue|n.|접착제, 붙이다
goal|n.|목표, 골
gold|n.|금, 금색
good|adj.|좋은, 상품(goods)
goodwill|n.|호의, 영업권
gorgeous|adj.|아주 멋진, 화려한
gossip|n.|소문, 험담
govern|v.|통치하다, 지배하다
government|n.|정부
governor|n.|주지사, 총재
grab|v.|움켜잡다, 급히 잡다
grace|n.|우아함, 유예 기간
grade|n.|등급, 성적
gradual|adj.|점진적인
gradually|adv.|점차, 서서히
graduate|v.|졸업하다, 졸업생
grain|n.|곡물, 알갱이
grand|adj.|웅장한, 대단한
grant|v.|수여하다, 보조금, 인정하다
grasp|v.|이해하다, 꽉 쥐다
grateful|adj.|감사하는
gratitude|n.|감사
grave|adj.|심각한, 무덤
gravity|n.|중력, 심각성
graze|v.|풀을 뜯다, 스치다
great|adj.|훌륭한, 큰
greed|n.|탐욕
green|adj.|초록의, 친환경의
greet|v.|맞이하다, 인사하다
greeting|n.|인사, 인사말
grief|n.|슬픔, 비탄
grill|v.|굽다, 심문하다
grim|adj.|암울한, 엄숙한
grin|v.|활짝 웃다
grind|v.|갈다, 빻다
grip|v.|꽉 쥐다, 장악력
grocery|n.|식료품점
gross|adj.|총계의, 총액의
ground|n.|땅, 근거
group|n.|집단, 그룹
grow|v.|성장하다, 재배하다
growth|n.|성장, 증가
grudge|n.|원한, 유감
guarantee|v.|보장하다, 보증서
guard|v.|지키다, 경비원
guess|v.|추측하다
guest|n.|손님, 투숙객
guidance|n.|안내, 지도
guide|n.|안내서, 가이드, 안내하다
guideline|n.|지침, 가이드라인
guilt|n.|죄책감, 유죄
guilty|adj.|유죄의, 죄책감을 느끼는
gulf|n.|만, 큰 격차
habit|n.|습관
habitat|n.|서식지
hail|v.|환영하다, 우박이 내리다
half|n.|절반
hall|n.|복도, 강당, 회관
halt|v.|중단하다, 정지시키다
hammer|n.|망치
hamper|v.|방해하다, 저해하다
hand|n.|손, 건네주다
handbook|n.|안내서, 편람
handicap|n.|장애, 불리한 조건
handle|v.|다루다, 처리하다
handsome|adj.|잘생긴, 상당한
handy|adj.|유용한, 편리한
hang|v.|걸다, 매달다
happen|v.|일어나다, 발생하다
happy|adj.|행복한
harass|v.|괴롭히다, 희롱하다
harbor|n.|항구, 품다
hard|adj.|어려운, 단단한, 열심히
hardly|adv.|거의 ~않다
hardship|n.|고난, 어려움
hardware|n.|하드웨어, 철물
harm|n.|해, 손해
harmful|adj.|해로운
harmony|n.|조화, 화합
harness|v.|활용하다, 제어하다
harsh|adj.|가혹한, 거친
harvest|n.|수확, 수확하다
haste|n.|서두름, 성급함
hate|v.|싫어하다, 증오하다
haul|v.|운반하다, 끌어당기다
haunt|v.|계속 떠오르다, 출몰하다
have|v.|가지다, 시키다
hazard|n.|위험, 위험 요소
hazardous|adj.|위험한, 유해한
head|n.|머리, 대표, 향하다
headache|n.|두통, 골칫거리
headline|n.|기사 제목, 헤드라인
headquarters|n.|본사, 본부
heal|v.|치유하다, 낫다
health|n.|건강
healthy|adj.|건강한, 건전한
heap|n.|더미, 많음
hear|v.|듣다
hearing|n.|청문회, 청력
heart|n.|심장, 핵심, 마음
heat|n.|열, 난방, 가열하다
heavy|adj.|무거운, 과중한
hedge|n.|울타리, 위험 회피
heed|v.|주의를 기울이다
height|n.|높이, 절정
heighten|v.|고조시키다, 높이다
heir|n.|상속인, 후계자
held|v.|개최된, 보유된
help|v.|돕다, 도움
helpful|adj.|도움이 되는
hence|adv.|그러므로, 지금부터
herald|v.|알리다, 예고하다
herd|n.|무리, 떼
heritage|n.|유산
hesitant|adj.|주저하는, 망설이는
hesitate|v.|주저하다, 망설이다
hidden|adj.|숨겨진
hide|v.|숨기다, 숨다
hierarchy|n.|위계질서, 계층
high|adj.|높은
highlight|v.|강조하다, 주요 부분
highly|adv.|매우, 대단히
highway|n.|고속도로
hike|n.|인상, 도보 여행
hinder|v.|방해하다, 저해하다
hint|n.|암시, 힌트
hire|v.|고용하다, 임차하다
history|n.|역사, 이력
hit|v.|치다, 타격을 입히다
hitherto|adv.|지금까지, 여태껏
hoard|v.|비축하다, 사재기하다
hobby|n.|취미
hold|v.|잡다, 개최하다, 보유하다
holder|n.|소유자, 보유자
hole|n.|구멍
holiday|n.|휴일, 휴가
hollow|adj.|속이 빈, 공허한
home|n.|집, 본국
honest|adj.|정직한
honesty|n.|정직
honor|n.|명예, 영광, 존경하다
honorable|adj.|명예로운, 존경할 만한
hook|n.|고리, 걸다
hope|n.|희망, 바라다
horizon|n.|지평선, 시야
horizontal|adj.|수평의, 가로의
horrible|adj.|끔찍한
horror|n.|공포
host|n.|주최자, 진행자, 개최하다
hostile|adj.|적대적인
hot|adj.|뜨거운, 인기 있는
hotel|n.|호텔
hour|n.|시간
house|n.|집, 의회, 수용하다
household|n.|가정, 가구
housing|n.|주택, 주거
hover|v.|맴돌다, 떠다니다
huge|adj.|거대한, 막대한
human|adj.|인간의, 사람
humble|adj.|겸손한, 초라한
humid|adj.|습한
humor|n.|유머
hunger|n.|배고픔, 갈망
hunt|v.|사냥하다, 찾다
hurdle|n.|장애물, 난관
hurry|v.|서두르다
hurt|v.|다치게 하다, 아프다
husband|n.|남편
hybrid|n.|혼합물, 하이브리드
hypothesis|n.|가설
icon|n.|아이콘, 상징
idea|n.|생각, 아이디어
ideal|adj.|이상적인, 완벽한
identical|adj.|동일한, 똑같은
identification|n.|신분증, 식별, 확인
identify|v.|식별하다, 확인하다, 파악하다
identity|n.|신원, 정체성
idle|adj.|한가한, 가동되지 않는
ignite|v.|점화하다, 촉발하다
ignorant|adj.|무지한, 모르는
ignore|v.|무시하다
ill|adj.|아픈, 나쁜
illegal|adj.|불법의
illness|n.|질병, 병
illuminate|v.|비추다, 해명하다
illusion|n.|환상, 착각
illustrate|v.|설명하다, 삽화를 넣다
illustration|n.|삽화, 설명, 예증
image|n.|이미지, 영상
imaginative|adj.|상상력이 풍부한
imagine|v.|상상하다
imitate|v.|모방하다
immediate|adj.|즉각적인, 바로 인접한
immediately|adv.|즉시, 곧바로
immense|adj.|엄청난, 막대한
immerse|v.|몰두시키다, 담그다
immigrate|v.|이민 오다
imminent|adj.|임박한, 촉박한
immune|adj.|면역이 있는, 면제되는
impact|n.|영향, 충격
impair|v.|손상시키다, 악화시키다
impart|v.|전하다, 주다
impatient|adj.|성급한, 참을성 없는
impede|v.|방해하다, 지연시키다
imperative|adj.|필수적인, 긴요한
implement|v.|시행하다, 실행하다
implementation|n.|시행, 이행
implicate|v.|연루시키다, 시사하다
implicit|adj.|암묵적인, 내포된
imply|v.|암시하다, 의미하다
import|v.|수입하다, 수입품
importance|n.|중요성
important|adj.|중요한
impose|v.|부과하다, 강요하다
impossible|adj.|불가능한
impress|v.|인상을 주다, 감명시키다
impression|n.|인상, 느낌
impressive|adj.|인상적인, 굉장한
improve|v.|개선하다, 향상시키다
improvement|n.|개선, 향상
impulse|n.|충동, 자극
inability|n.|무능력, 할 수 없음
inaccurate|adj.|부정확한
inadequate|adj.|부적절한, 불충분한
inappropriate|adj.|부적절한
inaugurate|v.|취임시키다, 개시하다
incentive|n.|장려책, 인센티브
incident|n.|사건, 일
incidental|adj.|부수적인, 우연한
incline|v.|기울이다, ~할 마음이 내키다
include|v.|포함하다
including|prep.|~을 포함하여
income|n.|소득, 수입
incompatible|adj.|양립할 수 없는, 호환되지 않는
incomplete|adj.|불완전한, 미완성의
inconvenience|n.|불편, 애로사항
incorporate|v.|통합하다, 법인화하다
increase|v.|증가하다, 늘리다
increasingly|adv.|점점 더
incredible|adj.|믿을 수 없는, 대단한
incur|v.|초래하다, (비용을) 발생시키다
indebted|adj.|빚을 진, 감사하는
indeed|adv.|정말로, 사실
indefinite|adj.|무기한의, 불명확한
independent|adj.|독립적인, 독자적인
index|n.|지수, 색인
indicate|v.|나타내다, 가리키다
indication|n.|징후, 표시
indicator|n.|지표, 지시계
indifferent|adj.|무관심한
indirect|adj.|간접적인
individual|n.|개인, 개별적인
induce|v.|유도하다, 유발하다
indulge|v.|빠지다, 충족시키다
industrial|adj.|산업의, 공업의
industry|n.|산업, 근면
inevitable|adj.|불가피한, 피할 수 없는
inexpensive|adj.|비싸지 않은, 저렴한
infant|n.|유아
infect|v.|감염시키다
infer|v.|추론하다
inferior|adj.|열등한, 하급의
infinite|adj.|무한한
inflation|n.|인플레이션, 물가 상승
inflict|v.|가하다, 입히다
influence|n.|영향, 영향을 미치다
influential|adj.|영향력 있는
inform|v.|알리다, 통지하다
informal|adj.|비공식적인, 격의 없는
information|n.|정보
informative|adj.|유익한 정보를 주는
infrastructure|n.|기반 시설, 인프라
infringe|v.|침해하다, 위반하다
ingenious|adj.|기발한, 독창적인
ingredient|n.|재료, 성분
inhabit|v.|거주하다, 살다
inherent|adj.|내재하는, 고유의
inherit|v.|물려받다, 상속받다
inhibit|v.|억제하다, 방해하다
initial|adj.|초기의, 처음의
initially|adv.|처음에, 당초에
initiate|v.|개시하다, 착수하다
initiative|n.|주도권, 새로운 계획
inject|v.|주입하다, 투입하다
injure|v.|부상을 입히다, 손상시키다
injury|n.|부상, 손해
inland|adj.|내륙의
inner|adj.|내부의, 내면의
innocent|adj.|무고한, 순수한
innovate|v.|혁신하다
innovation|n.|혁신
innovative|adj.|혁신적인
input|n.|입력, 투입
inquire|v.|문의하다, 조사하다
inquiry|n.|문의, 조사
insect|n.|곤충
insert|v.|삽입하다, 끼워 넣다
inside|prep.|~안에, 내부
insight|n.|통찰력, 이해
insist|v.|주장하다, 고집하다
inspect|v.|점검하다, 검사하다
inspection|n.|점검, 검사
inspector|n.|검사관, 감독관
inspire|v.|영감을 주다, 고무하다
install|v.|설치하다, 임명하다
installation|n.|설치, 시설
installment|n.|할부금, 분할
instance|n.|사례, 경우
instant|adj.|즉각적인, 순간의
instead|adv.|대신에
instinct|n.|본능
institute|n.|연구소, 협회, 제정하다
institution|n.|기관, 제도
instruct|v.|지시하다, 가르치다
instruction|n.|지시, 설명서, 교육
instructor|n.|강사, 교관
instrument|n.|기구, 악기, 수단
insufficient|adj.|불충분한
insulate|v.|단열하다, 격리하다
insult|v.|모욕하다
insurance|n.|보험
insure|v.|보험에 들다, 보장하다
intact|adj.|손상되지 않은, 온전한
intake|n.|섭취량, 유입
intangible|adj.|무형의
integrate|v.|통합하다
integration|n.|통합
integrity|n.|진실성, 무결성, 온전함
intellect|n.|지성
intellectual|adj.|지적인, 지식인
intelligence|n.|지능, 정보
intelligent|adj.|똑똑한, 지능적인
intend|v.|의도하다, ~할 작정이다
intense|adj.|강렬한, 치열한
intensify|v.|강화하다, 심화하다
intensity|n.|강도, 격렬함
intensive|adj.|집중적인
intent|n.|의도, 몰두하는
intention|n.|의도, 목적
interact|v.|상호작용하다, 소통하다
interaction|n.|상호작용, 교류
interest|n.|관심, 이자, 이익
interfere|v.|간섭하다, 방해하다
interference|n.|간섭, 방해
interim|adj.|임시의, 중간의
interior|n.|내부, 인테리어
intermediate|adj.|중급의, 중간의
internal|adj.|내부의, 사내의
international|adj.|국제적인
interpret|v.|해석하다, 통역하다
interpretation|n.|해석, 통역
interrupt|v.|방해하다, 중단시키다
interval|n.|간격, 휴식 시간
intervene|v.|개입하다, 중재하다
interview|n.|면접, 인터뷰
intimate|adj.|친밀한, 상세한
intricate|adj.|복잡한, 얽힌
intrigue|v.|흥미를 끌다, 음모
introduce|v.|소개하다, 도입하다
introduction|n.|소개, 도입, 서론
intrude|v.|침입하다, 방해하다
intuition|n.|직관, 직감
invade|v.|침략하다, 침해하다
invalid|adj.|무효의, 병약한
invaluable|adj.|매우 귀중한
invariable|adj.|변함없는
invent|v.|발명하다, 꾸며내다
invention|n.|발명, 발명품
inventory|n.|재고, 재고 목록
invest|v.|투자하다
investigate|v.|조사하다, 수사하다
investigation|n.|조사, 수사
investment|n.|투자, 투자금
investor|n.|투자자
invisible|adj.|눈에 보이지 않는
invitation|n.|초대, 초대장
invite|v.|초대하다, 요청하다
invoice|n.|송장, 청구서
involve|v.|포함하다, 관련시키다
involved|adj.|관련된, 복잡한
irony|n.|아이러니, 반어
irregular|adj.|불규칙한
irrelevant|adj.|관련 없는, 무관한
irrespective|adj.|~와 상관없이
irritate|v.|짜증나게 하다, 자극하다
island|n.|섬
isolate|v.|고립시키다, 격리하다
issue|n.|문제, 쟁점, 발행하다
item|n.|항목, 품목
itinerary|n.|여행 일정표
jail|n.|교도소, 감옥
jam|n.|혼잡, 잼, 끼이다
jar|n.|병, 항아리
jealous|adj.|질투하는
jeopardize|v.|위태롭게 하다
jerk|v.|홱 움직이다
jet|n.|제트기, 분사
jewel|n.|보석
job|n.|일, 직업, 직무
join|v.|가입하다, 합류하다, 연결하다
joint|adj.|공동의, 합동의
joke|n.|농담
journal|n.|학술지, 일지, 신문
journalist|n.|언론인, 기자
journey|n.|여정, 여행
joy|n.|기쁨
judge|v.|판단하다, 판사
judgment|n.|판단, 판결
judicial|adj.|사법의, 재판의
jump|v.|뛰다, 급등하다
junction|n.|교차점, 접합부
junior|adj.|하급의, 후배의
jurisdiction|n.|관할권, 사법권
jury|n.|배심원단, 심사위원단
just|adv.|방금, 단지, 공정한
justice|n.|정의, 사법
justify|v.|정당화하다, 해명하다
keen|adj.|열심인, 예리한
keep|v.|유지하다, 보관하다
key|n.|열쇠, 핵심적인
kick|v.|차다, 시작하다
kid|n.|아이, 놀리다
kill|v.|죽이다, 무효화하다
kind|n.|종류, 친절한
king|n.|왕
kitchen|n.|부엌, 주방
knock|v.|두드리다, 부딪히다
knot|n.|매듭
know|v.|알다
knowledge|n.|지식, 알고 있음
label|n.|라벨, 상표, 분류하다
labor|n.|노동, 근로
laboratory|n.|실험실, 연구실
lack|n.|부족, ~이 없다
ladder|n.|사다리
lag|v.|뒤처지다, 지연
land|n.|땅, 착륙하다
landlord|n.|집주인, 임대인
landmark|n.|주요 지형지물, 획기적 사건
landscape|n.|풍경, 환경
lane|n.|차선, 좁은 길
language|n.|언어
lap|n.|무릎, 바퀴
large|adj.|큰, 대규모의
largely|adv.|주로, 대체로
last|adj.|마지막의, 지속되다
late|adj.|늦은, 고인이 된
lately|adv.|최근에
latent|adj.|잠재적인
later|adv.|나중에
latest|adj.|최신의
latter|adj.|후자의
laugh|v.|웃다
launch|v.|출시하다, 시작하다
laundry|n.|세탁, 세탁물
law|n.|법, 법률
lawn|n.|잔디밭
lawsuit|n.|소송
lawyer|n.|변호사
lay|v.|놓다, 배치하다
layer|n.|층, 겹
layoff|n.|정리 해고
layout|n.|배치, 레이아웃
lazy|adj.|게으른
lead|v.|이끌다, 선두, 납
leader|n.|지도자, 선두주자
leadership|n.|리더십, 지도부
leading|adj.|주요한, 선도적인
leaf|n.|잎, 책장
leaflet|n.|전단, 소책자
league|n.|연맹, 리그
leak|v.|새다, 유출되다
lean|v.|기대다, 군더더기 없는
leap|v.|도약하다, 급증하다
learn|v.|배우다, 알게 되다
lease|n.|임대차 계약, 임대하다
least|adj.|가장 적은, 최소한
leather|n.|가죽
leave|v.|떠나다, 남기다, 휴가
lecture|n.|강의, 강연
ledger|n.|회계 장부
left|adj.|왼쪽의, 남은
legacy|n.|유산
legal|adj.|법적인, 합법적인
legend|n.|전설, 범례
legislation|n.|입법, 법률
legitimate|adj.|합법적인, 타당한
leisure|n.|여가
lend|v.|빌려주다
length|n.|길이, 기간
lenient|adj.|관대한, 너그러운
less|adj.|더 적은, 덜
lessen|v.|줄이다, 완화하다
lesson|n.|수업, 교훈
let|v.|~하게 하다, 임대하다
letter|n.|편지, 글자
level|n.|수준, 단계, 평평한
leverage|n.|지렛대, 영향력, 활용하다
levy|v.|부과하다, 징수하다
liability|n.|책임, 부채
liable|adj.|법적 책임이 있는, ~하기 쉬운
liaison|n.|연락 담당자, 연계
liberal|adj.|자유주의의, 관대한
liberate|v.|해방하다
liberty|n.|자유
library|n.|도서관
license|n.|면허, 허가증
lid|n.|뚜껑
lie|v.|거짓말하다, 눕다, 위치하다
life|n.|삶, 생명, 수명
lift|v.|들어 올리다, 해제하다
light|n.|빛, 가벼운
like|prep.|~처럼, 좋아하다
likely|adj.|~할 가능성이 있는
likewise|adv.|마찬가지로
limit|n.|한계, 제한하다
limitation|n.|제한, 한계
limited|adj.|제한된, 유한의
line|n.|선, 줄, 제품군
linen|n.|리넨, 침대 시트류
linger|v.|남다, 오래 끌다
link|n.|연결, 링크, 연결하다
liquid|n.|액체, 유동적인
list|n.|목록, 명단, 나열하다
listen|v.|듣다
literacy|n.|읽고 쓰는 능력, 소양
literal|adj.|문자 그대로의
literary|adj.|문학의
literature|n.|문학, 문헌, 홍보 인쇄물
litter|n.|쓰레기, 어지럽히다
little|adj.|작은, 거의 없는
live|v.|살다, 생방송의
livelihood|n.|생계
lively|adj.|활기찬, 생생한
load|n.|짐, 적재량, 싣다
loan|n.|대출, 대여, 빌려주다
lobby|n.|로비, 로비 활동을 벌이다
local|adj.|지역의, 현지의
locate|v.|위치를 찾다, 배치하다
location|n.|위치, 장소
lock|v.|잠그다, 자물쇠
lodge|n.|숙소, 산장, 제기하다
logic|n.|논리
logical|adj.|논리적인, 타당한
logistics|n.|물류, 병참
lone|adj.|혼자인, 단독의
lonely|adj.|외로운
long|adj.|긴, 오랫동안, 갈망하다
look|v.|보다, ~처럼 보이다
loom|v.|어렴풋이 나타나다, 임박하다
loop|n.|고리, 순환
loose|adj.|느슨한, 풀린
lose|v.|잃다, 지다
loss|n.|손실, 상실
lost|adj.|잃어버린, 길을 잃은
lot|n.|많은, 부지, 제비
loud|adj.|시끄러운, 큰 소리의
lounge|n.|휴게실, 라운지
love|v.|사랑하다
low|adj.|낮은
lower|v.|낮추다, 인하하다
loyal|adj.|충성스러운, 충실한
loyalty|n.|충성심, 충실도
luck|n.|행운
lucrative|adj.|수익성이 좋은, 돈벌이가 되는
luggage|n.|수하물
lump|n.|덩어리, 일시불
lunch|n.|점심
lure|v.|유인하다, 매력
luxury|n.|사치, 고급품
machine|n.|기계
machinery|n.|기계류
magazine|n.|잡지
magic|n.|마법, 마술
magnet|n.|자석
magnificent|adj.|장엄한, 훌륭한
magnify|v.|확대하다, 과장하다
magnitude|n.|규모, 중요성
mail|n.|우편, 우편물
main|adj.|주요한, 주된
mainly|adv.|주로
maintain|v.|유지하다, 주장하다
maintenance|n.|유지 보수, 관리
major|adj.|주요한, 전공하다
majority|n.|대다수, 과반수
make|v.|만들다, ~하게 하다
malfunction|n.|오작동, 고장
mall|n.|쇼핑몰
manage|v.|관리하다, 경영하다, 간신히 해내다
management|n.|경영, 경영진, 관리
manager|n.|관리자, 매니저
mandate|n.|권한, 명령, 의무화하다
mandatory|adj.|의무적인, 필수의
manifest|v.|나타내다, 명백한
manipulate|v.|조작하다, 다루다
manner|n.|방식, 예의
manual|n.|설명서, 수동의
manufacture|v.|제조하다, 생산하다
manufacturer|n.|제조업체
many|adj.|많은
map|n.|지도, 계획하다
margin|n.|여백, 수익률, 차이
marine|adj.|해양의, 바다의
mark|n.|표시, 점수, 기념하다
market|n.|시장, 판매하다
marketing|n.|마케팅, 판촉
marriage|n.|결혼
marry|v.|결혼하다
marvelous|adj.|놀라운, 훌륭한
mask|n.|마스크, 가리다
mass|n.|대량, 덩어리, 대중
massive|adj.|거대한, 대규모의
master|n.|달인, 석사, 숙달하다
match|v.|일치하다, 어울리다, 시합
mate|n.|동료, 짝
material|n.|재료, 자료, 물질적인
matter|n.|문제, 물질, 중요하다
mature|adj.|성숙한, 만기가 된
maximize|v.|극대화하다
maximum|n.|최대, 최고
may|aux.|~일지도 모른다, 5월
mayor|n.|시장
meal|n.|식사
mean|v.|의미하다, 의도하다, 평균
meaning|n.|의미, 뜻
meaningful|adj.|의미 있는
means|n.|수단, 방법, 재산
meanwhile|adv.|그동안에, 한편
measure|n.|조치, 척도, 측정하다
measurement|n.|측정, 치수
meat|n.|고기
mechanic|n.|정비사, 기계공
mechanical|adj.|기계의, 기계적인
mechanism|n.|장치, 구조, 메커니즘
medal|n.|메달
media|n.|언론, 매체
mediate|v.|중재하다, 조정하다
medical|adj.|의학의, 의료의
medicine|n.|약, 의학
mediocre|adj.|평범한, 그저 그런
medium|adj.|중간의, 매체
meet|v.|만나다, 충족하다
meeting|n.|회의, 만남
member|n.|회원, 구성원
membership|n.|회원 자격, 회원 수
memo|n.|메모, 사내 회람
memorable|adj.|기억할 만한
memorial|n.|기념물, 추모의
memory|n.|기억, 메모리
mend|v.|고치다, 수선하다
mental|adj.|정신의, 마음의
mention|v.|언급하다, 말하다
menu|n.|메뉴, 식단
merchandise|n.|상품, 물품
merchant|n.|상인, 무역상
mere|adj.|단지 ~에 불과한
merely|adv.|단지, 그저
merge|v.|합병하다, 통합하다
merger|n.|합병
merit|n.|장점, 공적, ~할 가치가 있다
mess|n.|엉망, 혼란
message|n.|메시지, 전언
metal|n.|금속
method|n.|방법, 방식
metropolitan|adj.|대도시의
micro|adj.|초소형의, 미시의
middle|n.|중앙, 중간
midst|n.|가운데, 한복판
might|aux.|~일지도 모른다, 힘
migrate|v.|이주하다, 이전하다
mild|adj.|온화한, 가벼운
mile|n.|마일
milestone|n.|이정표, 중대 시점
military|adj.|군사의, 군대의
milk|n.|우유
mill|n.|공장, 방앗간
mind|n.|마음, 정신, 꺼리다
mine|n.|광산, 나의 것, 채굴하다
mineral|n.|광물, 미네랄
minimal|adj.|최소한의
minimize|v.|최소화하다
minimum|n.|최소, 최저
minister|n.|장관, 목사
ministry|n.|부처, 성직
minor|adj.|사소한, 부전공, 미성년자
minority|n.|소수, 소수 집단
minus|prep.|~을 뺀, 적자의
minute|n.|분, 의사록(minutes)
miracle|n.|기적
mirror|n.|거울, 반영하다
mislead|v.|오도하다, 잘못 이끌다
miss|v.|놓치다, 그리워하다
missing|adj.|빠진, 행방불명의
mission|n.|임무, 사명
mistake|n.|실수, 오해하다
misunderstand|v.|오해하다
mitigate|v.|완화하다, 경감하다
mix|v.|섞다, 혼합하다
mixture|n.|혼합물
mobile|adj.|이동식의, 모바일의
mock|adj.|모의의, 조롱하다
mode|n.|방식, 모드
model|n.|모델, 모형, 본보기
moderate|adj.|적당한, 온건한
modern|adj.|현대의, 최신식의
modernize|v.|현대화하다
modest|adj.|겸손한, 적당한, 그리 크지 않은
modify|v.|수정하다, 변경하다
moist|adj.|촉촉한, 습한
moment|n.|순간, 중요성
momentum|n.|탄력, 추진력
monetary|adj.|화폐의, 금전적인
money|n.|돈, 자금
monitor|v.|감시하다, 관찰하다, 모니터
monopoly|n.|독점, 전매
month|n.|달, 개월
monthly|adj.|매월의, 월간의
mood|n.|기분, 분위기
moral|adj.|도덕적인, 교훈
more|adj.|더 많은, 더욱
moreover|adv.|게다가, 더욱이
morning|n.|아침, 오전
mortgage|n.|주택 담보 대출
most|adj.|대부분의, 가장
mostly|adv.|주로, 대개
motion|n.|움직임, 동의안
motivate|v.|동기를 부여하다
motivation|n.|동기 부여, 자극
motive|n.|동기, 이유
motor|n.|모터, 원동기
mount|v.|오르다, 설치하다, 증가하다
mountain|n.|산
mouse|n.|쥐, 마우스
mouth|n.|입, 입구
move|v.|움직이다, 이사하다, 감동시키다
movement|n.|움직임, 운동, 동향
movie|n.|영화
much|adj.|많은, 훨씬
multiple|adj.|다수의, 복합적인
multiply|v.|곱하다, 크게 늘리다
municipal|adj.|시의, 지방 자치의
murder|n.|살인
muscle|n.|근육
museum|n.|박물관
music|n.|음악
must|aux.|~해야 한다, 필수품
mutual|adj.|상호 간의, 공동의
mystery|n.|신비, 수수께끼
myth|n.|신화, 잘못된 통념
nail|n.|못, 손톱
naive|adj.|순진한
name|n.|이름, 지명하다
namely|adv.|즉, 다시 말해
narrative|n.|이야기, 서사
narrow|adj.|좁은, 좁히다
nation|n.|국가, 국민
national|adj.|국가의, 전국적인
native|adj.|원주민의, 모국의
natural|adj.|자연의, 당연한
nature|n.|자연, 본질, 성격
navigate|v.|항해하다, 길을 찾다, 헤쳐 나가다
near|prep.|~가까이에, 거의
nearby|adj.|인근의, 가까운
nearly|adv.|거의
neat|adj.|깔끔한, 단정한
necessary|adj.|필요한, 필수의
necessity|n.|필요성, 필수품
neck|n.|목
need|v.|필요로 하다, 필요
needle|n.|바늘
negative|adj.|부정적인, 음성의
neglect|v.|소홀히 하다, 방치하다
negligible|adj.|무시해도 될 정도의, 사소한
negotiable|adj.|협상 가능한
negotiate|v.|협상하다, 교섭하다
negotiation|n.|협상, 교섭
neighbor|n.|이웃
neighborhood|n.|이웃, 동네
neither|pron.|둘 다 아닌
nerve|n.|신경, 용기
nervous|adj.|긴장한, 불안한
nest|n.|둥지
net|n.|그물, 순(수)의
network|n.|네트워크, 연결망
neutral|adj.|중립의, 중간의
never|adv.|결코 ~않다
nevertheless|adv.|그럼에도 불구하고
new|adj.|새로운
newly|adv.|새로, 최근에
news|n.|뉴스, 소식
newsletter|n.|소식지, 뉴스레터
newspaper|n.|신문
next|adj.|다음의, 옆의
nice|adj.|좋은, 친절한
niche|n.|틈새, 적소
night|n.|밤
noble|adj.|고귀한, 숭고한
nod|v.|고개를 끄덕이다
noise|n.|소음, 잡음
nominal|adj.|명목상의, 아주 적은
nominate|v.|지명하다, 추천하다
nomination|n.|지명, 추천
none|pron.|아무것도 ~않다
nonetheless|adv.|그럼에도 불구하고
noon|n.|정오
norm|n.|규범, 표준
normal|adj.|정상적인, 보통의
north|n.|북쪽
nose|n.|코
notable|adj.|주목할 만한, 저명한
note|n.|메모, 지폐, 주목하다
notebook|n.|공책, 노트북
nothing|pron.|아무것도 ~아니다
notice|n.|공지, 통지, 알아차리다
noticeable|adj.|뚜렷한, 눈에 띄는
notification|n.|통지, 알림
notify|v.|통지하다, 알리다
notion|n.|개념, 생각
notorious|adj.|악명 높은
novel|n.|소설, 참신한
novelty|n.|새로움, 진기함
now|adv.|지금, 이제
nowadays|adv.|요즘에는
nowhere|adv.|어디에도 ~없다
nuclear|adj.|핵의, 원자력의
nuisance|n.|성가신 것, 골칫거리
null|adj.|무효의
number|n.|숫자, 수
numerous|adj.|수많은
nurse|n.|간호사, 돌보다
nurture|v.|양육하다, 육성하다
nutrition|n.|영양
obey|v.|복종하다, 따르다
object|n.|물체, 목표, 반대하다
objection|n.|반대, 이의
objective|n.|목표, 객관적인
obligation|n.|의무, 책임
oblige|v.|강요하다, 은혜를 베풀다
obscure|adj.|모호한, 무명의
observant|adj.|관찰력이 뛰어난
observation|n.|관찰, 의견
observe|v.|관찰하다, 준수하다
obsess|v.|사로잡다, 집착하다
obsolete|adj.|구식의, 더 이상 쓰이지 않는
obstacle|n.|장애물, 난관
obtain|v.|얻다, 획득하다
obvious|adj.|분명한, 명백한
obviously|adv.|분명히
occasion|n.|경우, 행사, 때
occasional|adj.|가끔의, 때때로의
occasionally|adv.|가끔, 때때로
occupation|n.|직업, 점유
occupy|v.|차지하다, 점유하다
occur|v.|발생하다, 일어나다
occurrence|n.|발생, 사건
ocean|n.|대양, 바다
odd|adj.|이상한, 홀수의
odds|n.|가능성, 승산
offend|v.|기분을 상하게 하다, 위반하다
offense|n.|위반, 공격
offer|v.|제공하다, 제안하다
offering|n.|제공물, 공모
office|n.|사무실, 직책
officer|n.|임원, 경찰관, 장교
official|adj.|공식적인, 공무원
offset|v.|상쇄하다, 보전하다
offshore|adj.|해외의, 앞바다의
often|adv.|자주, 종종
oil|n.|기름, 석유
old|adj.|오래된, 늙은
omit|v.|생략하다, 빠뜨리다
once|adv.|한 번, 일단 ~하면
ongoing|adj.|진행 중인
online|adj.|온라인의
only|adv.|오직, 유일한
onto|prep.|~위로
open|adj.|열린, 열다
opening|n.|개장, 공석, 시작
operate|v.|작동하다, 운영하다, 수술하다
operation|n.|운영, 작업, 수술
operational|adj.|운영상의, 가동 중인
operator|n.|교환원, 운영자
opinion|n.|의견, 견해
opponent|n.|상대, 반대자
opportunity|n.|기회
oppose|v.|반대하다
opposite|adj.|반대의, 맞은편의
opposition|n.|반대, 야당
opt|v.|선택하다, 고르다
optical|adj.|광학의, 시각의
optimal|adj.|최적의
optimistic|adj.|낙관적인
optimize|v.|최적화하다
option|n.|선택, 선택권, 옵션
optional|adj.|선택적인, 임의의
oral|adj.|구두의, 입의
orbit|n.|궤도
orchestra|n.|오케스트라
order|n.|주문, 순서, 명령하다
orderly|adj.|질서 정연한
ordinary|adj.|보통의, 평범한
organ|n.|기관, 장기
organic|adj.|유기농의, 유기의
organization|n.|조직, 단체
organize|v.|조직하다, 정리하다
orient|v.|지향하게 하다, 안내하다
orientation|n.|오리엔테이션, 지향
origin|n.|기원, 출신
original|adj.|원래의, 독창적인
originality|n.|독창성
originally|adv.|원래, 본래
originate|v.|유래하다, 비롯되다
ornament|n.|장식품
other|adj.|다른
otherwise|adv.|그렇지 않으면, 달리
ought|aux.|~해야 한다
ounce|n.|온스
outcome|n.|결과, 성과
outdoor|adj.|야외의
outer|adj.|외부의, 바깥쪽의
outfit|n.|복장, 채비
outgoing|adj.|외향적인, 퇴임하는
outlet|n.|판매점, 콘센트, 배출구
outline|n.|개요, 윤곽을 그리다
outlook|n.|전망, 관점
output|n.|생산량, 출력
outrage|n.|분노, 격분
outright|adv.|즉시, 노골적으로
outset|n.|착수, 시작
outside|prep.|~밖에, 외부
outstanding|adj.|뛰어난, 미지급된
outweigh|v.|~보다 더 크다, 능가하다
oval|adj.|타원형의
oven|n.|오븐
overall|adj.|전반적인, 전체의
overcome|v.|극복하다
overcrowd|v.|초만원이 되게 하다
overdue|adj.|기한이 지난, 연체된
overhaul|v.|철저히 점검하다, 개편하다
overhead|adj.|머리 위의, 간접비(경상비)
overhear|v.|우연히 듣다
overlap|v.|겹치다, 중복되다
overlook|v.|간과하다, 내려다보다
overnight|adv.|하룻밤 사이에, 밤새
overseas|adj.|해외의, 해외로
oversee|v.|감독하다, 관리하다
oversight|n.|감독, 실수(간과)
overtake|v.|추월하다, 앞지르다
overtime|n.|초과 근무, 연장전
overview|n.|개요, 개관
overwhelm|v.|압도하다
owe|v.|빚지다, 신세를 지다
own|adj.|자신의, 소유하다
owner|n.|소유주, 주인
ownership|n.|소유권
pace|n.|속도, 보폭
pack|v.|짐을 싸다, 포장하다
package|n.|소포, 패키지, 포장하다
packet|n.|작은 꾸러미, 패킷
pact|n.|협정, 조약
pad|n.|패드, 메모지
page|n.|페이지, 호출하다
paid|adj.|유급의, 지불된
pain|n.|고통, 수고
paint|v.|칠하다, 그리다
pair|n.|한 쌍, 짝
palace|n.|궁전
pale|adj.|창백한, 옅은
palm|n.|손바닥, 야자수
pamphlet|n.|소책자, 팜플렛
pan|n.|냄비, 프라이팬
panel|n.|패널, 위원회, 판
panic|n.|공황, 극심한 공포
paper|n.|종이, 서류, 논문
paperwork|n.|서류 작업
parade|n.|행진, 퍼레이드
paradigm|n.|패러다임, 전형
paradox|n.|역설, 모순
paragraph|n.|단락, 문단
parallel|adj.|평행의, 유사한
parameter|n.|매개변수, 한도
parcel|n.|소포, 꾸러미
pardon|v.|용서하다, 사면하다
parent|n.|부모, 모기업
park|n.|공원, 주차하다
parking|n.|주차
parliament|n.|의회, 국회
part|n.|부분, 역할, 헤어지다
partial|adj.|부분적인, 편파적인
partially|adv.|부분적으로
participant|n.|참가자
participate|v.|참여하다, 참가하다
participation|n.|참여, 참가
particle|n.|입자, 극소량
particular|adj.|특정한, 까다로운
particularly|adv.|특히
partly|adv.|부분적으로
partner|n.|동업자, 파트너
partnership|n.|제휴, 동업
party|n.|파티, 정당, 당사자
pass|v.|지나가다, 통과하다, 합격하다
passage|n.|통로, 지문, 통과
passenger|n.|승객
passion|n.|열정
passive|adj.|수동적인, 소극적인
passport|n.|여권
past|n.|과거, 지난
paste|v.|붙여넣다, 풀
pat|v.|가볍게 두드리다
patch|n.|패치, 좁은 땅
patent|n.|특허, 특허권
path|n.|길, 경로
patience|n.|인내심
patient|n.|환자, 인내심 있는
patrol|v.|순찰하다
patron|n.|후원자, 단골손님
pattern|n.|패턴, 무늬, 양상
pause|v.|잠시 멈추다, 휴지
pave|v.|포장하다, 길을 닦다
pay|v.|지불하다, 급여
payable|adj.|지불해야 할
payment|n.|지불, 납부, 대금
payroll|n.|급여 명부, 임금 총액
peace|n.|평화
peaceful|adj.|평화로운
peak|n.|절정, 정점, 산봉우리
peasant|n.|소작농, 농부
peculiar|adj.|특이한, 고유의
pedestrian|n.|보행자
peer|n.|동료, 또래, 자세히 보다
pen|n.|펜
penalty|n.|벌금, 처벌, 불이익
pending|adj.|보류 중인, 미결의
penetrate|v.|침투하다, 관통하다
pension|n.|연금
people|n.|사람들, 국민
per|prep.|~당, ~마다
perceive|v.|인식하다, 인지하다
percent|n.|퍼센트
percentage|n.|백분율, 비율
perception|n.|인식, 지각
perfect|adj.|완벽한
perfectly|adv.|완벽하게
perform|v.|수행하다, 공연하다
performance|n.|성과, 실적, 공연
perhaps|adv.|아마도
period|n.|기간, 시기, 마침표
periodic|adj.|주기적인, 정기적인
periodical|n.|정기 간행물
peripheral|adj.|주변의, 지엽적인
permanent|adj.|영구적인, 정규의
permission|n.|허가, 승인
permit|v.|허락하다, 허가증
persist|v.|지속하다, 고집하다
persistent|adj.|끈질긴, 지속적인
person|n.|사람, 개인
personal|adj.|개인의, 사적인
personality|n.|성격, 개성
personally|adv.|개인적으로
personnel|n.|인사과, 전 직원
perspective|n.|관점, 시각
persuade|v.|설득하다
persuasive|adj.|설득력 있는
pertain|v.|관련되다, 속하다
pertinent|adj.|관련된, 적절한
pessimistic|adj.|비관적인
pest|n.|해충
pet|n.|애완동물
petition|n.|청원서, 탄원하다
petrol|n.|휘발유
phase|n.|단계, 국면
phenomenon|n.|현상
philosophy|n.|철학
phone|n.|전화
photo|n.|사진
photocopy|n.|복사, 복사하다
phrase|n.|구절, 어구
physical|adj.|신체적인, 물리적인
physician|n.|내과 의사
pick|v.|고르다, 줍다
picnic|n.|소풍
picture|n.|그림, 사진
piece|n.|조각, 한 개
pier|n.|부두, 선착장
pile|n.|더미, 쌓다
pill|n.|알약
pillar|n.|기둥, 중추
pilot|n.|조종사, 시범의
pin|n.|핀, 고정하다
pinpoint|v.|정확히 찾아내다
pioneer|n.|개척자, 선구자
pipe|n.|파이프, 관
pitch|n.|투구, 사업 설명(피치), 음높이
pity|n.|동정, 유감
place|n.|장소, 놓다
plain|adj.|분명한, 평범한, 평원
plan|n.|계획, 계획하다
plane|n.|비행기, 평면
planet|n.|행성
plant|n.|공장, 식물, 심다
plastic|n.|플라스틱
plate|n.|접시, 판
platform|n.|플랫폼, 승강장, 연단
plausible|adj.|그럴듯한, 타당한
play|v.|놀다, 연주하다, 역할을 하다
player|n.|선수, 연주자, 주자
plea|n.|간청, 탄원
plead|v.|간청하다, 변호하다
pleasant|adj.|쾌적한, 즐거운
please|v.|기쁘게 하다, 제발
pleased|adj.|기쁜, 만족하는
pleasure|n.|기쁨, 즐거움
pledge|n.|서약, 맹세, 약속하다
plentiful|adj.|풍부한
plenty|n.|풍부, 많음
plot|n.|줄거리, 음모, 부지
plug|n.|플러그, 꽂다
plunge|v.|급락하다, 뛰어들다
plus|prep.|~을 더하여, 장점
pocket|n.|주머니
poem|n.|시
poet|n.|시인
point|n.|점, 요점, 가리키다
poison|n.|독, 오염시키다
pole|n.|기둥, 극
police|n.|경찰
policy|n.|정책, 방침, 보험 증권
polish|v.|닦다, 다듬다
polite|adj.|예의 바른
political|adj.|정치적인
politics|n.|정치
poll|n.|여론 조사, 투표
pollute|v.|오염시키다
pollution|n.|오염
pond|n.|연못
pool|n.|수영장, 공동 자금, 모으다
poor|adj.|가난한, 부실한, 서투른
pop|v.|갑자기 나타나다, 터지다
popular|adj.|인기 있는, 대중적인
popularity|n.|인기
populate|v.|거주하다
population|n.|인구
port|n.|항구, 포트
portable|adj.|휴대용의
portfolio|n.|포트폴리오, 투자 자산 목록
portion|n.|부분, 몫
portrait|n.|초상화
pose|v.|제기하다, 자세를 취하다
position|n.|위치, 직책, 입장
positive|adj.|긍정적인, 양성의
possess|v.|소유하다, 보유하다
possession|n.|소유, 소지품
possibility|n.|가능성
possible|adj.|가능한
possibly|adv.|아마도, 어떻게든
post|n.|우편, 게시물, 직책, 게시하다
postage|n.|우편 요금
postal|adj.|우편의
poster|n.|포스터
postpone|v.|연기하다, 미루다
posture|n.|자세, 태도
pot|n.|냄비, 화분
potential|adj.|잠재적인, 잠재력
potentially|adv.|잠재적으로
pound|n.|파운드, 두드리다
pour|v.|붓다, 쏟아지다
poverty|n.|가난, 빈곤
power|n.|힘, 전력, 권한
powerful|adj.|강력한
practical|adj.|실용적인, 실질적인
practically|adv.|사실상, 실질적으로
practice|n.|연습, 관행, 실행하다
praise|v.|칭찬하다
pray|v.|기도하다, 바라다
preach|v.|설교하다, 역설하다
precaution|n.|예방 조치
precede|v.|앞서다, 선행하다
precedent|n.|선례, 전례
precious|adj.|귀중한, 소중한
precise|adj.|정확한, 정밀한
precisely|adv.|정확히, 바로
precision|n.|정밀, 정확성
predecessor|n.|전임자, 이전 제품
predict|v.|예측하다, 예보하다
predictable|adj.|예측 가능한
prediction|n.|예측, 예보
predominant|adj.|지배적인, 우세한
prefer|v.|선호하다
preferable|adj.|더 바람직한
preference|n.|선호, 우선권
prefix|n.|접두사
pregnant|adj.|임신한
prejudice|n.|편견, 선입견
preliminary|adj.|예비의, 사전의
premier|adj.|최고의, 수석의
premiere|n.|초연, 개봉
premise|n.|전제, 구내(건물과 부지)
premium|n.|보험료, 프리미엄, 할증금
preparation|n.|준비, 대비
prepare|v.|준비하다
prescribe|v.|처방하다, 규정하다
prescription|n.|처방전
presence|n.|존재, 참석
present|adj.|현재의, 참석한, 선물, 제시하다
presentation|n.|발표, 프레젠테이션, 증정
presently|adv.|곧, 현재
preservation|n.|보존, 유지
preserve|v.|보존하다, 보호하다
preside|v.|주재하다, 사회를 보다
president|n.|대통령, 사장, 회장
press|v.|누르다, 언론, 압박하다
pressure|n.|압력, 압박
prestige|n.|위신, 명성
prestigious|adj.|명망 있는, 일류의
presume|v.|추정하다, 간주하다
pretend|v.|~인 척하다
prevail|v.|우세하다, 만연하다
prevalent|adj.|만연한, 널리 퍼진
prevent|v.|방지하다, 막다
prevention|n.|예방, 방지
previous|adj.|이전의
previously|adv.|이전에
price|n.|가격, 값을 매기다
pride|n.|자부심, 자존심
primarily|adv.|주로, 우선적으로
primary|adj.|주된, 초기의
prime|adj.|최고의, 주된
primitive|adj.|원시적인, 초기의
principal|adj.|주요한, 교장, 원금
principle|n.|원칙, 원리
print|v.|인쇄하다, 출력하다
prior|adj.|이전의, 사전의
priority|n.|우선순위, 우선 사항
privacy|n.|사생활, 개인정보 보호
private|adj.|사적인, 민간의, 비공개의
privilege|n.|특권, 혜택
prize|n.|상, 상품
pro|n.|전문가, 찬성
probable|adj.|개연성 있는, ~할 것 같은
probably|adv.|아마도
probe|v.|조사하다, 탐사하다
problem|n.|문제
procedure|n.|절차, 수순
proceed|v.|진행하다, 나아가다
proceeding|n.|진행, 소송 절차
proceeds|n.|수익금
process|n.|과정, 공정, 처리하다
proclaim|v.|선언하다, 공표하다
procure|v.|조달하다, 구하다
procurement|n.|조달, 구매
produce|v.|생산하다, 농산물
producer|n.|생산자, 제작자
product|n.|제품, 상품
production|n.|생산, 제조
productive|adj.|생산적인
productivity|n.|생산성
profession|n.|직업, 전문직
professional|adj.|전문적인, 전문가
professor|n.|교수
proficiency|n.|능숙함, 숙달
proficient|adj.|능숙한, 숙달된
profile|n.|프로필, 개요, 측면
profit|n.|이익, 수익
profitable|adj.|수익성이 있는
profound|adj.|심오한, 깊은
program|n.|프로그램, 계획
progress|n.|진전, 발전, 진행하다
progressive|adj.|점진적인, 진보적인
prohibit|v.|금지하다
prohibition|n.|금지
project|n.|프로젝트, 사업, 예상하다
projection|n.|예상치, 투영
prolong|v.|연장하다, 늘이다
prominent|adj.|저명한, 두드러진
promise|n.|약속, 약속하다
promising|adj.|유망한, 전도유망한
promote|v.|승진시키다, 홍보하다, 촉진하다
promotion|n.|승진, 판촉 행사, 홍보
prompt|adj.|신속한, 즉각적인, 촉발하다
promptly|adv.|신속하게, 즉시
prone|adj.|~하기 쉬운, ~하는 경향이 있는
pronounce|v.|발음하다, 선언하다
proof|n.|증거, 증명
proofread|v.|교정을 보다
propaganda|n.|선전
propel|v.|나아가게 하다, 추진하다
proper|adj.|적절한, 올바른
properly|adv.|제대로, 적절히
property|n.|재산, 부동산, 특성
proportion|n.|비율, 비중
proposal|n.|제안, 제안서
propose|v.|제안하다, 청혼하다
proposition|n.|제안, 명제
proprietary|adj.|독점의, 소유권이 있는
prospect|n.|전망, 가망 고객
prospective|adj.|장래의, 예비의
prosper|v.|번영하다, 번창하다
prosperity|n.|번영, 번창
protect|v.|보호하다
protection|n.|보호, 보안
protective|adj.|보호하는
protest|v.|항의하다, 시위하다
protocol|n.|규약, 의전, 프로토콜
prototype|n.|시제품, 원형
proud|adj.|자랑스러운
prove|v.|입증하다, 증명하다
provide|v.|제공하다, 공급하다
provided|conj.|만약 ~라면
province|n.|주, 도, 분야
provision|n.|공급, 대비, 조항
provoke|v.|유발하다, 도발하다
proximity|n.|근접, 가까움
prudent|adj.|신중한, 현명한
public|adj.|공공의, 대중의
publication|n.|출판물, 발행
publicity|n.|홍보, 언론의 관심
publicize|v.|홍보하다, 알리다
publish|v.|출판하다, 발표하다
publisher|n.|출판사
pull|v.|당기다, 철수하다
pulse|n.|맥박, 동향
pump|n.|펌프, 퍼 올리다
punch|v.|구멍을 뚫다, 치다
punctual|adj.|시간을 엄수하는
punish|v.|처벌하다
purchase|v.|구매하다, 구입
pure|adj.|순수한
purple|adj.|보라색의
purpose|n.|목적, 의도
pursue|v.|추구하다, 추적하다
pursuit|n.|추구, 일
push|v.|밀다, 추진하다
put|v.|놓다, 두다
puzzle|n.|퍼즐, 어리둥절하게 하다
qualification|n.|자격, 자격 요건
qualify|v.|자격을 얻다, 자격을 주다
quality|n.|품질, 자질
quantify|v.|수량화하다
quantity|n.|수량, 양
quarter|n.|분기, 4분의 1
quarterly|adj.|분기의, 분기마다
query|n.|질문, 문의
quest|n.|탐구, 탐색
question|n.|질문, 의문, 질문하다
questionnaire|n.|설문지
queue|n.|대기 줄, 줄을 서다
quick|adj.|빠른, 신속한
quickly|adv.|빠르게
quiet|adj.|조용한
quit|v.|그만두다, 사직하다
quite|adv.|꽤, 상당히
quota|n.|할당량, 쿼터
quotation|n.|견적서, 인용문
quote|v.|견적을 내다, 인용하다
race|n.|경주, 인종
rack|n.|선반, 받침대
radar|n.|레이더
radical|adj.|급진적인, 근본적인
radio|n.|라디오
rage|n.|격노, 분노
raid|n.|기습, 단속
rail|n.|철도, 난간
rain|n.|비
raise|v.|올리다, 모금하다, 제기하다
rally|v.|반등하다, 집회
ramification|n.|파급 효과, 결과
random|adj.|무작위의
range|n.|범위, 다양성, 걸치다
rank|n.|순위, 지위, 평가하다
rapid|adj.|빠른, 급속한
rapidly|adv.|급속히, 빠르게
rare|adj.|드문, 희귀한
rarely|adv.|좀처럼 ~않다
ratify|v.|비준하다, 인준하다
rate|n.|비율, 요금, 평가하다
rather|adv.|오히려, 꽤
rating|n.|등급, 평가
ratio|n.|비율
rational|adj.|합리적인, 이성적인
raw|adj.|날것의, 가공하지 않은
reach|v.|도달하다, 연락하다
react|v.|반응하다
reaction|n.|반응, 반작용
read|v.|읽다
readily|adv.|손쉽게, 기꺼이
ready|adj.|준비된
real|adj.|실제의, 진짜의
realize|v.|깨닫다, 실현하다
really|adv.|정말로
realty|n.|부동산
reap|v.|수확하다, 거두다
rear|n.|뒤쪽, 기르다
reason|n.|이유, 이성
reasonable|adj.|합리적인, 적당한
reassure|v.|안심시키다
rebate|n.|환불금, 리베이트
rebel|v.|반란을 일으키다
rebound|v.|반등하다, 되튀다
recall|v.|기억해 내다, 리콜하다
receipt|n.|영수증, 수령
receive|v.|받다, 수령하다
recent|adj.|최근의
recently|adv.|최근에
reception|n.|접수처, 환영회, 수신 상태
recession|n.|경기 침체, 불황
recipe|n.|조리법, 비법
recipient|n.|수령인, 수혜자
reckless|adj.|무모한, 부주의한
reckon|v.|생각하다, 계산하다
reclaim|v.|되찾다, 개간하다
recognition|n.|인정, 인식, 표창
recognize|v.|인식하다, 인정하다, 알아보다
recommend|v.|추천하다, 권고하다
recommendation|n.|추천, 권고, 추천서
reconcile|v.|화해시키다, 일치시키다
record|n.|기록, 최고 기록, 기록하다
recover|v.|회복하다, 되찾다
recovery|n.|회복, 복구
recreation|n.|여가 활동, 휴양
recruit|v.|모집하다, 채용하다
recruitment|n.|채용, 모집
rectify|v.|바로잡다, 시정하다
recur|v.|재발하다, 되풀이되다
recycle|v.|재활용하다
reduce|v.|줄이다, 감소시키다
reduction|n.|감소, 삭감, 할인
redundant|adj.|불필요한, 여분의, 정리 해고된
refer|v.|언급하다, 참고하다, 위탁하다
referee|n.|심판, 추천인
reference|n.|참고, 언급, 추천서
refine|v.|정제하다, 개선하다
reflect|v.|반영하다, 반사하다, 숙고하다
reflection|n.|반영, 반사, 성찰
reform|n.|개혁, 개선하다
refrain|v.|자제하다, 삼가다
refresh|v.|상쾌하게 하다, 새로 고치다
refreshment|n.|다과, 휴식
refrigerator|n.|냉장고
refuge|n.|피난처, 안식처
refund|n.|환불, 환불하다
refusal|n.|거절, 거부
refuse|v.|거절하다, 거부하다
regard|v.|간주하다, 관련, 안부
regarding|prep.|~에 관하여
regardless|adv.|~와 상관없이
regime|n.|정권, 체제
region|n.|지역, 지방
regional|adj.|지역의, 지방의
register|v.|등록하다, 기록하다
registration|n.|등록, 접수
regret|v.|후회하다, 유감스럽게 생각하다
regular|adj.|정기적인, 보통의
regularly|adv.|정기적으로
regulate|v.|규제하다, 조절하다
regulation|n.|규정, 규제
rehabilitate|v.|재활 치료하다, 복권하다
rehearse|v.|예행연습을 하다
reign|n.|통치, 지배
reimburse|v.|변제하다, 상환하다
reimbursement|n.|변제, 실비 정산
reinforce|v.|강화하다, 보강하다
reject|v.|거절하다, 불합격시키다
rejection|n.|거절, 불합격
relate|v.|관련시키다, 이야기하다
related|adj.|관련된
relation|n.|관계, 친척
relationship|n.|관계
relative|adj.|상대적인, 친척
relatively|adv.|비교적, 상대적으로
relax|v.|휴식을 취하다, 완화하다
release|v.|출시하다, 발표하다, 석방하다
relevant|adj.|관련된, 적절한
reliable|adj.|신뢰할 수 있는, 믿을 만한
reliance|n.|의존, 신뢰
relief|n.|안도, 구호, 경감
relieve|v.|완화하다, 덜어주다
religion|n.|종교
relocate|v.|이전하다, 재배치하다
relocation|n.|이전, 재배치
reluctant|adj.|꺼리는, 마지못해 하는
rely|v.|의지하다, 신뢰하다
remain|v.|남다, 여전히 ~이다
remainder|n.|나머지, 잔여
remaining|adj.|남아 있는
remark|n.|발언, 논평, 언급하다
remarkable|adj.|주목할 만한, 놀라운
remedy|n.|치료법, 해결책
remember|v.|기억하다
remind|v.|상기시키다
reminder|n.|알림, 독촉장
remote|adj.|외딴, 원격의
remove|v.|제거하다, 치우다
render|v.|만들다, 제공하다, 번역하다
renew|v.|갱신하다, 재개하다
renewal|n.|갱신, 재개
renovate|v.|개조하다, 보수하다
renovation|n.|개조, 리모델링
renowned|adj.|유명한, 명성 높은
rent|n.|임대료, 임차하다
rental|n.|임대, 대여
repair|v.|수리하다, 보수하다
repeat|v.|반복하다
repeatedly|adv.|반복해서, 거듭
repel|v.|격퇴하다, 쫓아내다
repertoire|n.|레퍼토리, 목록
replace|v.|대체하다, 교체하다
replacement|n.|교체, 후임자
reply|v.|대답하다, 답장하다
report|n.|보고서, 보도하다
reporter|n.|기자
represent|v.|대표하다, 나타내다
representative|n.|대표자, 영업 사원, 대표적인
reproduce|v.|복제하다, 번식하다
reputation|n.|평판, 명성
request|n.|요청, 요청하다
require|v.|요구하다, 필요로 하다
requirement|n.|요구 사항, 필요 조건
rescue|v.|구조하다, 구출
research|n.|연구, 조사하다
researcher|n.|연구원
resemble|v.|닮다
resent|v.|분개하다, 화를 내다
reservation|n.|예약, 의구심
reserve|v.|예약하다, 비축하다
reside|v.|거주하다
residence|n.|거주지, 주택
resident|n.|거주자, 주민
resign|v.|사임하다, 사직하다
resignation|n.|사임, 사직서
resist|v.|저항하다, 견디다
resistance|n.|저항, 반대
resolute|adj.|단호한, 확고한
resolution|n.|해결, 결의안, 해상도
resolve|v.|해결하다, 결심하다
resort|n.|휴양지, 의지하다
resource|n.|자원, 재원
respect|n.|존경, 측면, 존중하다
respective|adj.|각각의
respectively|adv.|각각, 저마다
respond|v.|응답하다, 반응하다
response|n.|응답, 반응
responsibility|n.|책임, 책무
responsible|adj.|책임이 있는
rest|n.|나머지, 휴식, 쉬다
restaurant|n.|식당
restore|v.|복구하다, 복원하다
restrain|v.|제지하다, 억제하다
restrict|v.|제한하다, 한정하다
restriction|n.|제한, 규제
restructure|v.|구조 조정하다, 개편하다
result|n.|결과, ~로 이어지다
resume|v.|재개하다, 이력서(résumé)
retail|n.|소매, 소매의
retailer|n.|소매업체
retain|v.|유지하다, 보유하다
retire|v.|은퇴하다, 퇴직하다
retirement|n.|은퇴, 퇴직
retreat|v.|후퇴하다, 휴양
retrieve|v.|되찾아오다, 검색하다
return|v.|돌아오다, 반품하다, 수익
reveal|v.|드러내다, 밝히다
revenue|n.|수익, 매출
reverse|v.|뒤집다, 반전시키다
review|n.|검토, 평론, 검토하다
revise|v.|수정하다, 개정하다
revision|n.|수정, 개정판
revive|v.|부활시키다, 회복하다
revoke|v.|취소하다, 철회하다
revolution|n.|혁명, 회전
reward|n.|보상, 보답하다
rhythm|n.|리듬, 율동
ribbon|n.|리본
rice|n.|쌀, 밥
rich|adj.|부유한, 풍부한
rid|v.|제거하다, 없애다
ride|v.|타다, 승차
ridge|n.|산등성이, 이랑
ridiculous|adj.|터무니없는, 우스꽝스러운
right|adj.|오른쪽의, 옳은, 권리
rigid|adj.|엄격한, 융통성 없는
ring|n.|반지, 고리, 울리다
riot|n.|폭동, 소동
ripe|adj.|익은, 무르익은
rise|v.|오르다, 증가하다, 상승
risk|n.|위험, 위험을 무릅쓰다
rival|n.|경쟁자, 필적하다
river|n.|강
road|n.|도로, 길
roam|v.|돌아다니다, 배회하다
roar|v.|포효하다, 굉음을 내다
rob|v.|강탈하다, 훔치다
robust|adj.|튼튼한, 견고한
rock|n.|바위, 흔들리다
rod|n.|막대기
role|n.|역할
roll|v.|구르다, 명부
roof|n.|지붕
room|n.|방, 여지, 공간
root|n.|뿌리, 근원
rope|n.|밧줄, 로프
rotate|v.|회전하다, 교대하다
rotten|adj.|썩은, 부패한
rough|adj.|거친, 대략적인
roughly|adv.|대략, 거칠게
round|adj.|둥근, 회차
route|n.|경로, 노선
routine|n.|일상, 정례적인
row|n.|줄, 열, 노를 젓다
royal|adj.|왕실의
rub|v.|문지르다
rubber|n.|고무
rude|adj.|무례한
ruin|v.|망치다, 파산시키다
rule|n.|규칙, 지배하다
rumor|n.|소문
run|v.|달리다, 운영하다, 출마하다
rural|adj.|시골의, 농촌의
rush|v.|서두르다, 돌진하다
rust|n.|녹, 녹슬다
sack|n.|자루, 해고하다
sacred|adj.|신성한
sacrifice|n.|희생, 희생하다
sad|adj.|슬픈
safe|adj.|안전한, 금고
safeguard|v.|보호하다, 안전장치
safety|n.|안전
sail|v.|항해하다, 돛
sake|n.|목적, 이유
salary|n.|급여, 봉급
sale|n.|판매, 할인 판매
salesperson|n.|판매원, 영업 사원
salt|n.|소금
salute|v.|경례하다, 경의를 표하다
same|adj.|같은, 동일한
sample|n.|견본, 샘플
sanction|n.|제재, 승인하다
sand|n.|모래
sanitation|n.|위생
satellite|n.|위성
satisfaction|n.|만족, 만족감
satisfactory|adj.|만족스러운
satisfy|v.|만족시키다, 충족하다
saturate|v.|포화 상태로 만들다
save|v.|구하다, 저축하다, 저장하다
savings|n.|저축, 절감액
say|v.|말하다
scale|n.|규모, 저울, 등급
scan|v.|훑어보다, 스캔하다
scandal|n.|추문, 스캔들
scarce|adj.|부족한, 드문
scarcely|adv.|거의 ~않다
scare|v.|겁주다, 놀라게 하다
scatter|v.|흩뿌리다, 흩어지다
scenario|n.|시나리오, 예상 상황
scene|n.|장면, 현장
scenery|n.|풍경, 경치
schedule|n.|일정, 예정하다
scheme|n.|계획, 책략
scholar|n.|학자
scholarship|n.|장학금, 학문
school|n.|학교, 학파
science|n.|과학
scientific|adj.|과학적인
scope|n.|범위, 영역
score|n.|점수, 악보, 득점하다
scorn|v.|경멸하다
scramble|v.|서둘러 하다, 뒤섞다
scrap|n.|조각, 폐기하다
scratch|v.|긁다, 찰과상
screen|n.|화면, 가림막, 심사하다
screw|n.|나사, 조이다
script|n.|대본, 원고, 스크립트
scrutinize|v.|면밀히 조사하다
scrutiny|n.|면밀한 조사
sculpture|n.|조각, 조각품
sea|n.|바다
seal|v.|밀봉하다, 도장
search|v.|찾다, 검색하다
season|n.|계절, 시즌, 양념하다
seasonal|adj.|계절의, 계절적인
seat|n.|좌석, 착석시키다
second|adj.|두 번째의, 초
secondary|adj.|이차적인, 부수적인
secret|n.|비밀, 비밀의
secretary|n.|비서, 장관
section|n.|구역, 부문, 조항
sector|n.|부문, 분야, 구역
secure|adj.|안전한, 확보하다
security|n.|보안, 안전, 유가증권
seek|v.|찾다, 추구하다
seem|v.|~처럼 보이다
segment|n.|부분, 구획, 계층
seize|v.|잡다, 압수하다, 포착하다
seldom|adv.|좀처럼 ~않다
select|v.|선택하다, 선별하다
selection|n.|선택, 선정된 것들
self|n.|자기, 자아
sell|v.|팔다, 판매하다
semester|n.|학기
seminar|n.|세미나, 연수회
senate|n.|상원
send|v.|보내다, 발송하다
senior|adj.|상급의, 선배의, 고령의
sensation|n.|감각, 큰 반향
sense|n.|감각, 분별력, 느끼다
sensible|adj.|분별 있는, 합리적인
sensitive|adj.|민감한, 세심한
sentence|n.|문장, 선고
sentiment|n.|정서, 감정
separate|adj.|분리된, 별개의, 나누다
separately|adv.|별도로, 따로따로
sequence|n.|순서, 연속
series|n.|연속, 시리즈
serious|adj.|진지한, 심각한
seriously|adv.|진지하게, 심각하게
servant|n.|하인, 공무원
serve|v.|제공하다, 근무하다, 시중들다
service|n.|서비스, 근무, 점검
session|n.|회의, 회기, 시간
set|v.|두다, 설정하다, 세트
setting|n.|환경, 배경, 설정
settle|v.|해결하다, 정착하다, 정산하다
settlement|n.|합의, 정착, 결제
several|adj.|몇몇의, 여러
severe|adj.|심각한, 가혹한
severely|adv.|심하게, 엄격히
sew|v.|바느질하다, 꿰매다
shade|n.|그늘, 색조
shadow|n.|그림자
shake|v.|흔들다, 동요시키다
shallow|adj.|얕은, 피상적인
shame|n.|수치, 유감
shape|n.|모양, 형태, 형성하다
share|v.|공유하다, 나누다, 주식
shareholder|n.|주주
sharp|adj.|날카로운, 급격한, 정각에
sharply|adv.|급격히, 날카롭게
shatter|v.|산산이 부수다
shed|v.|떨구다, 비추다, 창고
sheer|adj.|순전한, 가파른
sheet|n.|종이 한 장, 시트
shelf|n.|선반
shell|n.|껍데기, 조개껍질
shelter|n.|피난처, 보호소
shield|n.|방패, 보호하다
shift|v.|옮기다, 교대 근무, 변화
shine|v.|빛나다
ship|n.|배, 선적하다, 발송하다
shipment|n.|선적, 화물, 배송
shipping|n.|배송, 해운
shock|n.|충격, 충격을 주다
shoe|n.|신발
shoot|v.|쏘다, 촬영하다
shop|n.|가게, 쇼핑하다
shore|n.|해안, 기슭
short|adj.|짧은, 부족한
shortage|n.|부족, 결핍
shortcoming|n.|결점, 단점
shorten|v.|단축하다, 줄이다
shortly|adv.|곧, 얼마 안 있어
shot|n.|발사, 시도, 사진
should|aux.|~해야 한다
shoulder|n.|어깨, 떠맡다
shout|v.|소리치다
show|v.|보여주다, 전시회
shower|n.|소나기, 샤워
shred|v.|갈기갈기 찢다, 파쇄하다
shrink|v.|줄어들다, 축소되다
shrug|v.|어깨를 으쓱하다
shut|v.|닫다
shuttle|n.|왕복 교통편, 셔틀
shy|adj.|수줍어하는
sick|adj.|아픈
side|n.|쪽, 측면, 편
sight|n.|시력, 광경, 명소
sign|n.|표지판, 징후, 서명하다
signal|n.|신호, 신호를 보내다
signature|n.|서명
significance|n.|중요성, 의미
significant|adj.|중요한, 상당한
significantly|adv.|상당히, 크게
silence|n.|침묵, 정적
silent|adj.|조용한, 침묵하는
silk|n.|비단, 실크
silly|adj.|어리석은
silver|n.|은, 은색
similar|adj.|비슷한, 유사한
similarity|n.|유사성
simple|adj.|단순한, 간단한
simplify|v.|단순화하다
simply|adv.|단순히, 그저
simulate|v.|모의실험하다, 흉내 내다
simultaneous|adj.|동시의
since|prep.|~이래로, ~때문에
sincere|adj.|진심 어린, 성실한
sing|v.|노래하다
single|adj.|단 하나의, 미혼의
sink|v.|가라앉다, 하락하다
sir|n.|선생님, 귀하
site|n.|장소, 부지, 사이트
situate|v.|위치시키다
situation|n.|상황, 위치
size|n.|크기, 규모
sketch|n.|스케치, 개략
skill|n.|기술, 숙련도
skilled|adj.|숙련된
skillful|adj.|능숙한, 솜씨 좋은
skin|n.|피부, 껍질
skip|v.|건너뛰다, 빼먹다
sky|n.|하늘
slack|adj.|느슨한, 침체된
slam|v.|쾅 닫다, 맹비난하다
slap|v.|손바닥으로 치다
slash|v.|대폭 삭감하다, 베다
slave|n.|노예
sleep|v.|자다, 수면
slice|n.|조각, 얇게 썰다
slide|v.|미끄러지다, 슬라이드
slight|adj.|약간의, 경미한
slightly|adv.|약간, 조금
slim|adj.|날씬한, 희박한
slip|v.|미끄러지다, 종이쪽지
slogan|n.|구호, 슬로건
slope|n.|경사, 비탈
slot|n.|시간대, 틈, 자리
slow|adj.|느린, 둔화시키다
slump|n.|급락, 침체
small|adj.|작은, 소규모의
smart|adj.|똑똑한, 세련된
smash|v.|박살 내다
smell|n.|냄새, 냄새를 맡다
smile|n.|미소, 미소 짓다
smoke|n.|연기, 담배 피우다
smooth|adj.|매끄러운, 순조로운
smoothly|adv.|순조롭게, 원활히
snack|n.|간식
snap|v.|딱 부러지다, 찰칵 찍다
snatch|v.|낚아채다
snow|n.|눈
soak|v.|적시다, 담그다
soar|v.|치솟다, 급등하다
sober|adj.|술 취하지 않은, 냉철한
social|adj.|사회의, 사교적인
society|n.|사회, 협회
software|n.|소프트웨어
soil|n.|토양, 흙
solar|adj.|태양의
sole|adj.|유일한, 단독의
solely|adv.|오직, 단독으로
solemn|adj.|엄숙한, 진지한
solicit|v.|간청하다, 요청하다
solid|adj.|고체의, 견고한, 확실한
solution|n.|해결책, 용액
solve|v.|해결하다, 풀다
somehow|adv.|어떻게든, 웬일인지
somewhat|adv.|어느 정도, 다소
soon|adv.|곧, 머지않아
sophisticated|adj.|세련된, 정교한
sore|adj.|아픈, 쓰린
sorry|adj.|미안한, 유감스러운
sort|n.|종류, 분류하다
soul|n.|영혼
sound|n.|소리, 건전한, ~처럼 들리다
source|n.|출처, 근원, 원천
south|n.|남쪽
souvenir|n.|기념품
sovereign|adj.|주권이 있는, 군주
space|n.|공간, 우주, 여백
spacious|adj.|넓은, 널찍한
span|n.|기간, 범위, 걸치다
spare|adj.|여분의, 할애하다
spark|v.|불꽃, 촉발하다
speak|v.|말하다
speaker|n.|화자, 연설자, 스피커
special|adj.|특별한
specialist|n.|전문가
specialize|v.|전문화하다, 전공하다
specialty|n.|전문 분야, 특산품
species|n.|종(생물)
specific|adj.|구체적인, 특정한
specifically|adv.|구체적으로, 특히
specification|n.|명세서, 사양
specify|v.|명시하다, 구체적으로 말하다
specimen|n.|표본, 견본
spectacle|n.|장관, 구경거리
spectacular|adj.|장관인, 극적인
spectator|n.|관중, 구경꾼
spectrum|n.|스펙트럼, 범위
speculate|v.|추측하다, 투기하다
speech|n.|연설, 말
speed|n.|속도, 속력을 내다
spell|v.|철자를 쓰다, 기간
spend|v.|쓰다, 소비하다
sphere|n.|구, 영역
spill|v.|쏟다, 유출하다
spin|v.|회전하다, 돌리다
spirit|n.|정신, 기분
spiritual|adj.|정신적인, 영적인
spite|n.|악의, ~에도 불구하고(in spite of)
splash|v.|튀기다
splendid|adj.|훌륭한, 화려한
split|v.|쪼개다, 나누다
spoil|v.|망치다, 상하다
spokesperson|n.|대변인
sponsor|n.|후원자, 후원하다
spontaneous|adj.|자발적인, 즉흥적인
spoon|n.|숟가락
sport|n.|스포츠, 운동
spot|n.|장소, 점, 발견하다
spotlight|n.|조명, 집중 조명
spouse|n.|배우자
spread|v.|퍼뜨리다, 확산되다
spring|n.|봄, 용수철, 튀어 오르다
spur|v.|자극하다, 박차를 가하다
spy|n.|스파이, 첩자
squad|n.|반, 팀, 분대
square|n.|정사각형, 광장
squeeze|v.|짜다, 압박하다
stable|adj.|안정적인, 마구간
stability|n.|안정, 안정성
stabilize|v.|안정시키다
stack|n.|더미, 쌓다
stadium|n.|경기장
staff|n.|직원, 참모
stage|n.|단계, 무대
stagnant|adj.|침체된, 정체된
stain|n.|얼룩, 얼룩지게 하다
stair|n.|계단
stake|n.|지분, 이해관계
stale|adj.|신선하지 않은, 진부한
stall|n.|가판대, 지연시키다
stamp|n.|우표, 도장
stand|v.|서다, 참다, 가판대
standard|n.|표준, 기준, 표준의
standardize|v.|표준화하다
standing|n.|지위, 평판, 상설의
staple|adj.|주된, 기본 품목
star|n.|별, 스타
stare|v.|응시하다, 뚫어지게 보다
start|v.|시작하다, 출발
startle|v.|깜짝 놀라게 하다
starve|v.|굶주리다
state|n.|상태, 주, 국가, 진술하다
statement|n.|성명, 진술, 명세서
static|adj.|정적인, 고정된
station|n.|역, 정거장, 배치하다
stationery|n.|문구류
statistics|n.|통계, 통계학
statue|n.|조각상
status|n.|지위, 상태, 현황
statute|n.|법령, 규정
stay|v.|머무르다, 유지하다
steady|adj.|꾸준한, 안정된
steal|v.|훔치다
steam|n.|증기
steel|n.|강철
steep|adj.|가파른, 터무니없는
steer|v.|조종하다, 이끌다
stem|n.|줄기, 유래하다
step|n.|단계, 걸음, 조치
stereotype|n.|고정관념
stern|adj.|엄격한, 단호한
stick|v.|붙이다, 찌르다, 막대기
stiff|adj.|뻣뻣한, 엄격한
still|adv.|여전히, 고요한
stimulate|v.|자극하다, 활성화하다
stimulus|n.|자극, 경기 부양책
sting|v.|쏘다, 찌르다
stipulate|v.|규정하다, 명시하다
stir|v.|휘젓다, 불러일으키다
stock|n.|주식, 재고, 비축하다
stomach|n.|위, 배
stone|n.|돌
stop|v.|멈추다, 정류장
storage|n.|저장, 보관, 창고
store|n.|가게, 저장하다
storm|n.|폭풍
story|n.|이야기, 기사, 층
stove|n.|난로, 가스레인지
straight|adj.|똑바른, 곧장
strain|n.|부담, 긴장, 팽팽히 당기다
strange|adj.|이상한, 낯선
stranger|n.|낯선 사람
strap|n.|끈, 묶다
strategic|adj.|전략적인
strategy|n.|전략
stream|n.|개울, 흐름, 스트리밍
streamline|v.|간소화하다, 합리화하다
street|n.|거리, 도로
strength|n.|힘, 강점
strengthen|v.|강화하다
stress|n.|스트레스, 강조하다
stretch|v.|뻗다, 늘이다
strict|adj.|엄격한, 엄밀한
strictly|adv.|엄격히, 엄밀히
stride|n.|큰 걸음, 발전
strike|v.|치다, 파업하다, 인상적이다
string|n.|끈, 줄, 일련
strip|v.|벗기다, 가늘고 긴 조각
strive|v.|노력하다, 분투하다
stroke|n.|뇌졸중, 쓰다듬다, 획
strong|adj.|강한, 튼튼한
structure|n.|구조, 건축물, 구성하다
struggle|v.|고투하다, 노력하다
stubborn|adj.|고집 센, 완고한
student|n.|학생
studio|n.|스튜디오, 작업실
study|n.|공부, 연구, 연구하다
stuff|n.|물건, 채워 넣다
stumble|v.|발을 헛디디다
stun|v.|기절시키다, 깜짝 놀라게 하다
stupid|adj.|어리석은
sturdy|adj.|튼튼한, 견고한
style|n.|스타일, 양식
subject|n.|주제, 과목, 대상, ~의 영향을 받는
subjective|adj.|주관적인
submit|v.|제출하다, 복종하다
subordinate|adj.|하급의, 부하 직원
subscribe|v.|구독하다, 가입하다
subscription|n.|구독, 구독료
subsequent|adj.|그 다음의, 차후의
subsequently|adv.|그 후에, 이어서
subsidiary|n.|자회사, 부수적인
subsidize|v.|보조금을 지급하다
subsidy|n.|보조금, 지원금
substance|n.|물질, 본질, 실체
substantial|adj.|상당한, 실질적인
substantially|adv.|상당히, 크게
substitute|v.|대체하다, 대리인
subtle|adj.|미묘한, 섬세한
subtract|v.|빼다
suburb|n.|교외
subway|n.|지하철
succeed|v.|성공하다, 뒤를 잇다
success|n.|성공
successful|adj.|성공적인
succession|n.|연속, 계승
successive|adj.|연속적인, 잇따른
successor|n.|후임자, 계승자
such|det.|그러한
suck|v.|빨다
sudden|adj.|갑작스러운
suddenly|adv.|갑자기
sue|v.|고소하다, 소송을 제기하다
suffer|v.|고통받다, 겪다
sufficient|adj.|충분한
sufficiently|adv.|충분히
sugar|n.|설탕
suggest|v.|제안하다, 시사하다
suggestion|n.|제안, 시사
suit|n.|정장, 소송, 적합하다
suitable|adj.|적합한, 알맞은
suite|n.|스위트룸, 세트
sum|n.|합계, 금액
summarize|v.|요약하다
summary|n.|요약, 개요
summer|n.|여름
summit|n.|정상, 정상 회담
summon|v.|소환하다, 호출하다
sun|n.|태양
super|adj.|최고의, 엄청난
superficial|adj.|피상적인, 표면적인
superior|adj.|우월한, 상급의, 상사
supervise|v.|감독하다, 관리하다
supervision|n.|감독, 관리
supervisor|n.|감독관, 상사
supplement|n.|보충, 부록, 보충하다
supplier|n.|공급업체
supply|v.|공급하다, 공급품
support|v.|지원하다, 지지하다, 후원
suppose|v.|가정하다, ~일 거라고 생각하다
suppress|v.|억압하다, 억누르다
supreme|adj.|최고의, 최상의
sure|adj.|확실한, 확신하는
surface|n.|표면, 수면으로 드러나다
surge|v.|급증하다, 급등
surgeon|n.|외과 의사
surgery|n.|수술
surpass|v.|능가하다, 뛰어넘다
surplus|n.|잉여, 흑자
surprise|n.|놀람, 놀라게 하다
surrender|v.|항복하다, 포기하다
surround|v.|둘러싸다
surrounding|adj.|주변의, 인근의
survey|n.|설문 조사, 측량하다
survive|v.|생존하다, 견뎌 내다
suspect|v.|의심하다, 용의자
suspend|v.|중단하다, 정직시키다, 매달다
suspense|n.|긴장감, 불안감
suspension|n.|중단, 정직, 유예
suspicion|n.|의심, 혐의
suspicious|adj.|의심스러운, 수상한
sustain|v.|유지하다, 지속하다, 입다
sustainable|adj.|지속 가능한
swallow|v.|삼키다
swap|v.|교환하다, 맞바꾸다
swear|v.|맹세하다, 욕하다
sweat|n.|땀
sweep|v.|쓸다, 휩쓸다
sweet|adj.|달콤한
swell|v.|부풀다, 증가하다
swift|adj.|신속한, 빠른
swim|v.|수영하다
swing|v.|흔들다, 변동하다
switch|v.|전환하다, 스위치
symbol|n.|상징, 기호
sympathy|n.|동정, 공감
symptom|n.|증상, 징후
syndrome|n.|증후군
synthetic|adj.|합성의, 인조의
system|n.|체계, 시스템
systematic|adj.|체계적인
table|n.|표, 탁자
tackle|v.|다루다, 해결하려 들다
tact|n.|재치, 요령
tactic|n.|전술, 전략
tag|n.|꼬리표, 태그
tailor|n.|재단사, 맞추다
take|v.|가져가다, 걸리다, 수강하다
tale|n.|이야기
talent|n.|재능, 인재
talented|adj.|재능 있는
talk|v.|말하다, 강연
tall|adj.|키가 큰, 높은
tame|v.|길들이다
tangible|adj.|유형의, 만질 수 있는
tank|n.|탱크, 수조
tap|v.|가볍게 두드리다, 수도꼭지, 활용하다
tape|n.|테이프, 녹화하다
target|n.|목표, 표적, 겨냥하다
tariff|n.|관세
task|n.|업무, 과제
taste|n.|맛, 취향
tax|n.|세금, 과세하다
taxi|n.|택시
tea|n.|차
teach|v.|가르치다
team|n.|팀, 협력하다
tear|v.|찢다, 눈물
tease|v.|놀리다
technical|adj.|기술적인, 전문적인
technique|n.|기법, 기술
technology|n.|기술, 과학 기술
tedious|adj.|지루한, 따분한
teenager|n.|십 대
telecommute|v.|재택근무하다
telephone|n.|전화기
television|n.|텔레비전
tell|v.|말하다, 구별하다
temper|n.|성질, 기질
temperature|n.|온도, 기온
temple|n.|사원, 신전
temporary|adj.|임시의, 일시적인
tempt|v.|유혹하다, 부추기다
tenant|n.|세입자, 임차인
tend|v.|~하는 경향이 있다, 돌보다
tendency|n.|경향, 추세
tender|adj.|부드러운, 입찰, 제출하다
tennis|n.|테니스
tense|adj.|긴장한, 시제
tension|n.|긴장, 갈등
tent|n.|텐트
tentative|adj.|잠정적인, 임시의
term|n.|용어, 기간, 조건(terms)
terminal|n.|터미널, 말기의
terminate|v.|종료하다, 해고하다
termination|n.|종료, 해고
terrace|n.|테라스
terrible|adj.|끔찍한, 형편없는
terrific|adj.|아주 훌륭한, 멋진
territory|n.|영토, 영업 구역
terror|n.|공포, 테러
test|n.|시험, 검사, 시험하다
testify|v.|증언하다, 입증하다
testimony|n.|증언, 증거
text|n.|본문, 문자, 텍스트
textile|n.|직물, 섬유
texture|n.|질감, 감촉
thank|v.|감사하다
thankful|adj.|감사하는
theater|n.|극장, 영화관
theft|n.|절도, 도난
theme|n.|주제, 테마
theoretical|adj.|이론적인
theory|n.|이론, 학설
therapy|n.|치료, 요법
thereby|adv.|그로써, 그것 때문에
therefore|adv.|그러므로, 따라서
thermal|adj.|열의, 보온의
thick|adj.|두꺼운, 짙은
thief|n.|도둑
thin|adj.|얇은, 마른
thing|n.|것, 사물, 상황
think|v.|생각하다
thirst|n.|갈증, 갈망
thorough|adj.|철저한, 빈틈없는
thoroughly|adv.|철저히, 완전히
though|conj.|비록 ~이지만, 하지만
thought|n.|생각, 사고
thoughtful|adj.|사려 깊은, 배려하는
thousand|n.|천
thread|n.|실, 맥락, 글타래
threat|n.|위협, 협박
threaten|v.|위협하다
threshold|n.|문지방, 기준점, 한계점
thrill|n.|스릴, 전율
thrive|v.|번창하다, 잘 자라다
throat|n.|목구멍
throne|n.|왕좌
through|prep.|~을 통해
throughout|prep.|~내내, 곳곳에
throw|v.|던지다
thrust|v.|밀치다, 추진력
thumb|n.|엄지손가락
thunder|n.|천둥
thus|adv.|따라서, 이와 같이
ticket|n.|표, 티켓, 범칙금
tide|n.|조수, 조류, 흐름
tidy|adj.|단정한, 깔끔한
tie|v.|묶다, 넥타이, 동점, 유대
tight|adj.|꽉 조이는, 빠듯한
tighten|v.|조이다, 강화하다
tile|n.|타일
till|conj.|~까지
tilt|v.|기울이다
timber|n.|목재
time|n.|시간, 시기, 횟수
timely|adj.|시기적절한
timetable|n.|시간표
timid|adj.|소심한, 겁 많은
tin|n.|주석, 깡통
tiny|adj.|아주 작은
tip|n.|끝, 팁(봉사료), 조언
tire|v.|피곤하게 하다, 타이어
tired|adj.|피곤한, 싫증 난
tissue|n.|화장지, 조직
title|n.|제목, 직함, 소유권
toast|n.|토스트, 건배하다
tobacco|n.|담배
today|adv.|오늘, 오늘날
toe|n.|발가락
together|adv.|함께
toil|v.|힘들게 일하다
toilet|n.|화장실
token|n.|표시, 토큰, 상징적인
tolerate|v.|참다, 용인하다
toll|n.|통행료, 사상자 수
tomorrow|adv.|내일
ton|n.|톤
tone|n.|어조, 색조, 음조
tongue|n.|혀, 언어
tonight|adv.|오늘 밤
tool|n.|도구, 수단
tooth|n.|이, 치아
top|n.|꼭대기, 최고의
topic|n.|주제, 화제
torch|n.|횃불, 손전등
torture|n.|고문, 고통
toss|v.|던지다
total|adj.|전체의, 총계
totally|adv.|완전히
touch|v.|만지다, 감동시키다, 연락
tough|adj.|힘든, 강인한, 엄격한
tour|n.|관광, 순회, 견학
tourism|n.|관광업
tourist|n.|관광객
tournament|n.|토너먼트, 선수권 대회
toward|prep.|~을 향해
tower|n.|탑, 우뚝 솟다
town|n.|마을, 소도시
toxic|adj.|유독성의
toy|n.|장난감
trace|v.|추적하다, 흔적
track|n.|선로, 추적하다, 경로
trade|n.|무역, 거래, 업종
trademark|n.|상표
tradition|n.|전통
traditional|adj.|전통적인
traffic|n.|교통, 통행량
tragedy|n.|비극
tragic|adj.|비극적인
trail|n.|오솔길, 흔적, 뒤처지다
train|n.|기차, 훈련하다
trainee|n.|수습생, 훈련생
training|n.|훈련, 교육
trait|n.|특성, 특징
transaction|n.|거래, 처리
transcript|n.|성적 증명서, 기록 사본
transfer|v.|옮기다, 전근 가다, 환승하다
transform|v.|변형시키다, 탈바꿈하다
transformation|n.|변화, 변혁
transit|n.|수송, 환승
transition|n.|전환, 과도기
translate|v.|번역하다
translation|n.|번역
transmit|v.|전송하다, 전달하다
transparent|adj.|투명한, 명백한
transport|v.|운송하다, 수송
transportation|n.|운송, 교통수단
trap|n.|함정, 가두다
trash|n.|쓰레기
travel|v.|여행하다, 이동하다
tray|n.|쟁반
treasure|n.|보물, 소중히 여기다
treat|v.|대우하다, 치료하다, 한턱내다
treatment|n.|대우, 치료, 처리
treaty|n.|조약, 협정
tree|n.|나무
tremendous|adj.|엄청난, 대단한
trend|n.|추세, 유행
trial|n.|재판, 시범 사용, 시련
triangle|n.|삼각형
tribe|n.|부족, 집단
tribute|n.|찬사, 헌사, 조공
trick|n.|속임수, 비결
trigger|v.|유발하다, 촉발하다
trim|v.|다듬다, 삭감하다
trip|n.|여행, 출장
triple|adj.|세 배의, 삼중의
triumph|n.|승리, 대성공
trivial|adj.|사소한, 하찮은
troop|n.|병력, 무리
trophy|n.|트로피, 전리품
tropical|adj.|열대의
trouble|n.|문제, 곤란, 수고
trousers|n.|바지
truck|n.|트럭, 화물차
true|adj.|사실인, 진정한
truly|adv.|진심으로, 참으로
trunk|n.|트렁크, 나무줄기
trust|n.|신뢰, 신탁, 믿다
truth|n.|진실, 사실
try|v.|시도하다, 노력하다
tube|n.|관, 튜브, 지하철
tuck|v.|밀어 넣다
tuition|n.|수업료, 등록금
tumble|v.|굴러떨어지다, 폭락하다
tune|n.|곡조, 조율하다
tunnel|n.|터널
turbulence|n.|난기류, 격동
turkey|n.|칠면조
turn|v.|돌다, 변하다, 차례
turnover|n.|매출액, 이직률
tutor|n.|개인 교사, 지도하다
twice|adv.|두 번, 두 배로
twin|n.|쌍둥이
twist|v.|비틀다, 왜곡하다
type|n.|유형, 타자를 치다
typical|adj.|전형적인, 대표적인
typically|adv.|일반적으로, 전형적으로
ugly|adj.|못생긴, 험악한
ultimate|adj.|궁극적인, 최후의
ultimately|adv.|궁극적으로, 결국
umbrella|n.|우산
unable|adj.|~할 수 없는
unanimous|adj.|만장일치의
unaware|adj.|알지 못하는
uncertain|adj.|불확실한
uncertainty|n.|불확실성
uncle|n.|삼촌
uncomfortable|adj.|불편한
uncommon|adj.|드문, 흔치 않은
undergo|v.|겪다, 받다
undergraduate|n.|학부생
underground|adj.|지하의, 비밀의
underline|v.|밑줄을 긋다, 강조하다
underlying|adj.|근본적인, 기저에 깔린
undermine|v.|약화시키다, 훼손하다
underneath|prep.|~바로 아래에
understand|v.|이해하다
understanding|n.|이해, 합의
undertake|v.|착수하다, 떠맡다
undo|v.|원상태로 돌리다, 풀다
uneasy|adj.|불안한, 불편한
unemployed|adj.|실직한
unemployment|n.|실업, 실업률
unexpected|adj.|예기치 않은
unfair|adj.|불공정한
unfold|v.|펼치다, 전개되다
unfortunate|adj.|불운한, 유감스러운
unfortunately|adv.|안타깝게도, 불행히도
uniform|n.|제복, 균일한
unify|v.|통일하다, 통합하다
union|n.|노동조합, 연합
unique|adj.|독특한, 유일무이한
unit|n.|단위, 부서, 가구
unite|v.|결합하다, 단결하다
universal|adj.|보편적인, 전 세계의
universe|n.|우주
university|n.|대학교
unknown|adj.|알려지지 않은, 무명의
unless|conj.|~하지 않는 한
unlike|prep.|~와 달리
unlikely|adj.|~할 것 같지 않은
unlimited|adj.|무제한의
unload|v.|짐을 내리다
unlock|v.|잠금을 해제하다
unnecessary|adj.|불필요한
unpack|v.|짐을 풀다
unprecedented|adj.|전례 없는
unpleasant|adj.|불쾌한
unreasonable|adj.|불합리한, 터무니없는
unrest|n.|불안, 동요
unveil|v.|공개하다, 발표하다
unusual|adj.|특이한, 이례적인
update|v.|갱신하다, 최신 정보
upgrade|v.|등급을 올리다, 업그레이드하다
uphold|v.|지지하다, 유지하다
upload|v.|업로드하다
upon|prep.|~위에, ~하자마자
upper|adj.|위쪽의, 상위의
upset|adj.|속상한, 뒤엎다
upside|n.|상승 여력, 좋은 면
upstairs|adv.|위층으로
upturn|n.|호전, 상승세
urban|adj.|도시의
urge|v.|촉구하다, 충동
urgent|adj.|긴급한, 시급한
usage|n.|사용법, 사용량
use|v.|사용하다, 이용
useful|adj.|유용한
useless|adj.|쓸모없는
user|n.|사용자
usual|adj.|보통의, 평소의
usually|adv.|보통, 대개
utility|n.|공공요금, 공익사업, 유용성
utilize|v.|활용하다, 이용하다
utmost|adj.|최대의, 극도의
utter|v.|말하다, 완전한
vacant|adj.|비어 있는, 결원의
vacation|n.|휴가, 방학
vaccine|n.|백신
vacuum|n.|진공, 청소기
vague|adj.|모호한, 희미한
vain|adj.|헛된, 자만하는
valid|adj.|유효한, 타당한
validate|v.|검증하다, 유효화하다
valley|n.|계곡
valuable|adj.|귀중한, 가치 있는
value|n.|가치, 평가하다
van|n.|승합차, 밴
vanish|v.|사라지다
variable|adj.|변동이 심한, 변수
variation|n.|변화, 변형
varied|adj.|다양한
variety|n.|다양성, 종류
various|adj.|다양한, 여러 가지의
vary|v.|다르다, 다양하다
vast|adj.|방대한, 거대한
vegetable|n.|채소
vehicle|n.|차량, 수단
veil|n.|베일, 가리다
velocity|n.|속도
vendor|n.|판매업체, 노점상
venture|n.|모험 사업, 벤처, 과감히 해보다
venue|n.|행사 장소, 개최지
verbal|adj.|말로 된, 구두의
verdict|n.|평결, 판단
verify|v.|확인하다, 입증하다
versatile|adj.|다재다능한, 다용도의
verse|n.|운문, 구절
version|n.|판, 버전
versus|prep.|~대(vs.), ~와 대비하여
vertical|adj.|수직의, 세로의
vessel|n.|선박, 그릇, 혈관
veteran|n.|베테랑, 참전 용사
veto|v.|거부권을 행사하다
via|prep.|~을 경유하여, ~을 통해
viable|adj.|실행 가능한, 생존 가능한
vibrant|adj.|활기찬, 선명한
vice|adj.|부의, 대리의
vicinity|n.|인근, 부근
victim|n.|피해자, 희생자
victory|n.|승리
video|n.|비디오, 영상
view|n.|견해, 경치, 보다
viewer|n.|시청자, 관람객
viewpoint|n.|관점, 견해
vigor|n.|활력, 정력
vigorous|adj.|활발한, 격렬한
village|n.|마을
violate|v.|위반하다, 침해하다
violation|n.|위반, 침해
violence|n.|폭력
violent|adj.|폭력적인, 격렬한
virtual|adj.|가상의, 사실상의
virtually|adv.|사실상, 거의
virtue|n.|미덕, 장점
virus|n.|바이러스
visa|n.|비자, 사증
visible|adj.|눈에 보이는
vision|n.|시력, 비전, 통찰력
visit|v.|방문하다
visitor|n.|방문자, 관광객
visual|adj.|시각의, 눈에 보이는
vital|adj.|필수적인, 활력 있는
vivid|adj.|생생한, 선명한
vocabulary|n.|어휘, 단어장
vocal|adj.|목소리의, 거침없이 말하는
vocation|n.|천직, 직업
voice|n.|목소리, 표명하다
void|adj.|무효의, 빈 공간
volatile|adj.|변동성이 큰, 휘발성의
volcano|n.|화산
volume|n.|부피, 음량, 권, 거래량
voluntary|adj.|자발적인, 자원봉사의
volunteer|n.|자원봉사자, 자진해서 하다
vote|v.|투표하다, 표
voucher|n.|상품권, 바우처, 지출 증빙서
vow|v.|맹세하다, 서약하다
voyage|n.|항해, 여행
vulnerable|adj.|취약한, 연약한
wage|n.|임금, 급여
wagon|n.|마차, 짐수레
waist|n.|허리
wait|v.|기다리다
waiter|n.|웨이터, 종업원
waive|v.|포기하다, 면제하다
wake|v.|깨다, 깨우다
walk|v.|걷다, 산책
wall|n.|벽, 담
wallet|n.|지갑
wander|v.|돌아다니다, 헤매다
want|v.|원하다, 부족하다
war|n.|전쟁
ward|n.|병동, 구역
warehouse|n.|창고, 물류 센터
warm|adj.|따뜻한, 친절한
warmth|n.|따뜻함, 온정
warn|v.|경고하다
warning|n.|경고, 주의
warrant|v.|정당화하다, 보증하다, 영장
warranty|n.|품질 보증서
wash|v.|씻다, 세탁하다
waste|v.|낭비하다, 쓰레기
watch|v.|지켜보다, 시계
water|n.|물, 물을 주다
wave|n.|파도, 물결, 흔들다
way|n.|방법, 길, 방식
weak|adj.|약한, 부진한
weaken|v.|약화시키다
weakness|n.|약점, 약화
wealth|n.|부, 재산
wealthy|adj.|부유한
weapon|n.|무기
wear|v.|입다, 닳다
weather|n.|날씨, 이겨 내다
weave|v.|짜다, 엮다
web|n.|거미줄, 웹
wedding|n.|결혼식
week|n.|주, 일주일
weekend|n.|주말
weekly|adj.|매주의, 주간의
weigh|v.|무게가 나가다, 저울질하다
weight|n.|무게, 비중
weird|adj.|기이한, 이상한
welcome|v.|환영하다
welfare|n.|복지, 후생
well|adv.|잘, 건강한, 우물
west|n.|서쪽
wet|adj.|젖은, 비가 오는
whale|n.|고래
whatever|pron.|무엇이든지
wheat|n.|밀
wheel|n.|바퀴, 운전대
whenever|conj.|~할 때마다
whereas|conj.|~인 반면에
whereby|adv.|그것에 의해
whether|conj.|~인지 아닌지
while|conj.|~하는 동안, 반면에
whip|n.|채찍, 휘젓다
whisper|v.|속삭이다
whistle|v.|휘파람을 불다
white|adj.|흰색의
whole|adj.|전체의, 온전한
wholesale|n.|도매, 도매의
wholly|adv.|전적으로, 완전히
wide|adj.|넓은, 광범위한
widen|v.|넓히다, 확대하다
widespread|adj.|널리 퍼진
widow|n.|과부
width|n.|너비, 폭
wife|n.|아내
wild|adj.|야생의, 거친
will|aux.|~할 것이다, 의지, 유언장
willing|adj.|기꺼이 ~하는
willingly|adv.|기꺼이
win|v.|이기다, 획득하다
wind|n.|바람, 감다
window|n.|창문, 창구
wine|n.|포도주
wing|n.|날개, 별관
winner|n.|우승자, 수상자
winter|n.|겨울
wipe|v.|닦다, 지우다
wire|n.|전선, 송금하다
wireless|adj.|무선의
wisdom|n.|지혜
wise|adj.|현명한
wish|v.|바라다, 소원
withdraw|v.|인출하다, 철회하다, 철수하다
withdrawal|n.|인출, 철회, 철수
withhold|v.|보류하다, 주지 않다
within|prep.|~이내에
without|prep.|~없이
withstand|v.|견뎌 내다, 버티다
witness|n.|목격자, 증인, 목격하다
woman|n.|여성
wonder|v.|궁금해하다, 경이로움
wonderful|adj.|멋진, 훌륭한
wood|n.|나무, 목재
wool|n.|양모, 모직
word|n.|단어, 말
work|n.|일, 작품, 작동하다
worker|n.|근로자, 작업자
workforce|n.|노동력, 전 직원
workload|n.|업무량
workplace|n.|직장, 일터
workshop|n.|작업장, 워크숍
world|n.|세계, 세상
worldwide|adj.|전 세계적인
worm|n.|벌레
worry|v.|걱정하다, 걱정
worse|adj.|더 나쁜, 악화된
worsen|v.|악화되다
worship|v.|숭배하다, 예배
worst|adj.|최악의
worth|adj.|~의 가치가 있는
worthwhile|adj.|가치 있는, 보람 있는
worthy|adj.|가치가 있는, 훌륭한
would|aux.|~할 것이다
wound|n.|상처, 부상
wrap|v.|포장하다, 싸다
wreck|v.|난파시키다, 망치다
wrench|n.|렌치, 비틀다
wrestle|v.|씨름하다, 고심하다
wrist|n.|손목
write|v.|쓰다, 작성하다
writer|n.|작가
written|adj.|서면의, 쓰여진
wrong|adj.|잘못된, 틀린
yard|n.|마당, 야드
yawn|v.|하품하다
year|n.|년, 해
yearly|adj.|매년의, 연간의
yell|v.|소리치다
yellow|adj.|노란색의
yesterday|adv.|어제
yet|adv.|아직, 그러나
yield|v.|산출하다, 양보하다, 수익률
young|adj.|젊은, 어린
youth|n.|젊음, 청년기
zeal|n.|열정, 열의
zero|n.|영, 제로
zone|n.|구역, 지대
zoo|n.|동물원
zoom|v.|급상승하다, 확대하다
`;

function parseVocabList(): AutocompleteVocabEntry[] {
  const seen = new Set<string>();
  const list: AutocompleteVocabEntry[] = [];

  for (const rawLine of RAW_TOEIC_VOCAB.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split('|');
    if (parts.length < 3) continue;
    const word = parts[0].trim();
    const partOfSpeech = parts[1].trim();
    const meaning = parts.slice(2).join('|').trim();
    const key = word.toLowerCase();
    if (word && !seen.has(key)) {
      seen.add(key);
      list.push({ word, partOfSpeech, meaning });
    }
  }

  return list;
}

export const TOEIC_VOCAB_LIST: AutocompleteVocabEntry[] = parseVocabList();
