export type FaqScope = 'common' | 'db' | 'dc'
export type FaqCategory =
  | 'contribution'
  | 'default_option'
  | 'irp'
  | 'withdrawal'
  | 'retirement'

export interface FaqItem {
  id: string
  scope: FaqScope
  category: FaqCategory
  question: string
  answer: string
  keywords: string[]
}

export const faqCategoryLabels: Record<FaqCategory, string> = {
  contribution: '부담금·납입',
  default_option: '디폴트옵션',
  irp: 'IRP',
  withdrawal: '중도인출',
  retirement: '퇴직급여 처리',
}

// 원본: onboarding-team2/ai .chatbot/data/faq.json
// scope 기준으로 DC형 전용 / 공통(DB·DC 모두) 으로 분류함.
export const faqData: FaqItem[] = [
  {
    id: 'faq-001',
    scope: 'dc',
    category: 'contribution',
    question: 'DC형 퇴직연금 부담금은 언제 납입하나요?',
    answer:
      'DC형 퇴직연금 부담금은 가입자의 연간 임금총액의 12분의 1 이상을 매년 1회 이상 정기적으로 납입해야 합니다. 회사의 규약에 따라 월납, 분기납, 연납 방식으로 운영할 수 있습니다.',
    keywords: ['DC', '부담금', '납입', '주기', '월납', '분기납', '연납', '넣어'],
  },
  {
    id: 'faq-002',
    scope: 'dc',
    category: 'default_option',
    question: '디폴트옵션은 무엇인가요?',
    answer:
      '디폴트옵션은 DC형 또는 IRP 가입자가 별도의 운용 지시를 하지 않을 때 사전에 지정된 방법으로 적립금을 운용하는 제도입니다. 장기 수익률과 가입자 보호를 위해 고용노동부 승인 상품을 기준으로 운영합니다.',
    keywords: ['디폴트옵션', '사전지정운용방법', '운용 지시', '적립금 운용'],
  },
  {
    id: 'faq-003',
    scope: 'common',
    category: 'irp',
    question: '퇴직급여는 IRP로 받아야 하나요?',
    answer:
      '퇴직급여는 원칙적으로 가입자 명의의 IRP 계좌로 이전됩니다. 다만 법령상 예외 사유가 있는 경우 일시금 수령이 가능할 수 있으므로 구체적인 상황은 담당자에게 확인해야 합니다.',
    keywords: ['퇴직급여', 'IRP', '계좌', '이전', '일시금', '수령', '받아야'],
  },
  {
    id: 'faq-004',
    scope: 'dc',
    category: 'withdrawal',
    question: '퇴직연금 중도인출은 언제 가능한가요?',
    answer:
      'DC형과 IRP의 중도인출은 무주택자의 주택 구입, 전세보증금 부담, 6개월 이상 요양, 파산 또는 개인회생 등 법령에서 정한 사유가 있을 때 가능합니다.',
    keywords: ['중도인출', '중간 인출', '인출', '무주택', '주택구입', '전세보증금', '요양', '파산', '개인회생'],
  },
  {
    id: 'faq-1001',
    scope: 'common',
    category: 'retirement',
    question: '근로계약서상 퇴직금을 받지 않기로 합의한 경우 퇴직금을 지급하지 않아도 되나요?',
    answer:
      '근로계약서에 퇴직금 미지급 합의 조항이 있더라도 퇴직금 지급 의무는 법적으로 면제되지 않습니다. 근로기준법 제34조에 따라 퇴직금은 의무적으로 지급해야 합니다.',
    keywords: ['근로계약서', '계약서', '퇴직금', '미지급', '합의', '받지', '안 받', '지급하지'],
  },
  {
    id: 'faq-1002',
    scope: 'common',
    category: 'retirement',
    question: '4대 보험 가입이력이 없는 근로자도 퇴직금을 지급해야 하나요?',
    answer:
      '네, 4대 보험 가입 여부와 무관하게 1년 이상 근무한 근로자에게는 퇴직금을 지급해야 합니다. 퇴직금 지급 대상은 고용보험 등 보험 가입 이력이 아닌 근로기간으로 판단됩니다.',
    keywords: ['4대 보험', '보험', '가입 이력', '가입', '근로자', '직원', '지급 대상', '1년'],
  },
  {
    id: 'faq-1003',
    scope: 'common',
    category: 'retirement',
    question: '퇴사 후 재입사하여 1년 미만 근무하고 퇴직한 경우에도 퇴직금을 지급해야 하나요?',
    answer:
      '재입사 시 기존 근속기간이 합산되지 않으므로, 재입사 후 1년 미만 근무 시 퇴직금을 지급하지 않아도 됩니다. 단, 회사 내규에 따라 별도 규정이 있는 경우 예외가 적용될 수 있습니다.',
    keywords: ['재입사', '퇴사 후 재입사', '근속기간', '합산', '다시 입사', '1년 미만'],
  },
  {
    id: 'faq-1004',
    scope: 'common',
    category: 'retirement',
    question: '과세이연등록이 무엇이며, 어떤 경우에 해야 하나요?',
    answer:
      '과세이연등록은 퇴직금을 IRP 계좌로 이체할 때 소득세를 즉시 납부하지 않고 연금 수령 시까지 과세 시점을 연기하는 절차입니다. IRP 계좌로 퇴직금을 지급하는 경우 반드시 진행해야 합니다.',
    keywords: ['과세이연', '과세이연등록', 'IRP', '이체', '등록', '퇴직금 지급', '세금 연기'],
  },
  {
    id: 'faq-1005',
    scope: 'common',
    category: 'retirement',
    question: '‘이전금액과 계좌입금금액 불일치’로 IRP 해지가 안 되는 경우 해결 방법은?',
    answer:
      '이전금액과 계좌입금금액이 불일치할 경우, 금융기관과 협력업체 간 재확인이 필요합니다. 입금 확인 후 시스템에서 금액을 조정하면 해지 절차가 진행됩니다.',
    keywords: ['이전금액', '계좌입금금액', '입금금액', '불일치', 'IRP 해지', '해지', '금액 조정'],
  },
  {
    id: 'faq-1006',
    scope: 'common',
    category: 'retirement',
    question: '근로자가 사망한 경우 업무처리방법은 어떻게 되나요?',
    answer:
      '사망 시 상속인에게 퇴직급여를 지급해야 합니다. 상속인 확인 서류(가족관계증명서, 상속인 결정 확인서 등)를 수령한 후 절차를 진행합니다.',
    keywords: ['사망', '상속인', '가족관계증명서', '상속인 확인', '퇴직급여 지급'],
  },
  {
    id: 'faq-1007',
    scope: 'common',
    category: 'retirement',
    question: '근로자가 행방불명/연락두절인 경우 지급방법은 어떻게 되나요?',
    answer:
      '행방불명 시 공시송달 절차를 통해 퇴직급여를 공탁소에 예치할 수 있습니다. 관련 법원 판결문 또는 공문서 확보가 선행되어야 합니다.',
    keywords: ['행방불명', '연락두절', '공시송달', '공탁소', '예치', '법원 판결문'],
  },
  {
    id: 'faq-1008',
    scope: 'common',
    category: 'retirement',
    question: '회사에서 퇴직금을 별도로 지급한 경우 적립금을 반환할 수 있나요?',
    answer:
      '네, 「근로자퇴직급여 보장법」 제20조에 따라 회사가 퇴직금을 직접 지급한 경우, 해당 금액만큼 퇴직연금 적립금을 반환받을 수 있습니다.',
    keywords: ['회사 직접 지급', '퇴직금 별도 지급', '적립금 반환', '반환', '제20조'],
  },
  {
    id: 'faq-1009',
    scope: 'common',
    category: 'retirement',
    question: '여러 회사의 퇴직금을 하나의 IRP로 받을 수 있나요?',
    answer:
      '네, 가능합니다. 단, IRP 계좌에서 각 회사별 입금 내역을 명확히 구분해야 하며, 과세이연 등록 시 각 거래 내역을 별도로 관리해야 합니다.',
    keywords: ['여러 회사', '하나의 IRP', 'IRP', '입금 내역', '회사별', '과세이연'],
  },
  {
    id: 'faq-1010',
    scope: 'common',
    category: 'retirement',
    question: '계약이전 신청 전 준비사항은 무엇인가요?',
    answer:
      '계약이전 신청 전 수관 금융회사의 계좌 정보, 가입자 동의서, 신분증 사본 등을 확인해야 합니다. 간소화 대상 여부는 금융결제원 시스템을 통해 사전 검토가 필요합니다.',
    keywords: ['계약이전', '수관 금융회사', '계좌 정보', '가입자 동의서', '신분증 사본', '간소화'],
  },
]

/** 제도 유형별 FAQ (공통 + 해당 유형 전용) */
export const getFaqsByPlan = (plan: 'db' | 'dc'): FaqItem[] =>
  faqData.filter((faq) => faq.scope === 'common' || faq.scope === plan)
