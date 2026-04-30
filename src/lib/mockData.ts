import type { PortfolioEntry } from "@/lib/types";

export const mockEntries: PortfolioEntry[] = [
  {
    id: "project-smart-farm",
    ownerId: "user-a",
    type: "project",
    title: "AI Smart Farm Energy Monitor",
    summary: "온도와 습도 데이터를 바탕으로 스마트팜 환경 변화를 분석하는 AI 시뮬레이션 프로젝트입니다.",
    description:
      "센서 데이터 흐름을 설계하고 Python 기반 분석 모델로 환경 변화를 시각화했습니다. 발표 자료와 보고서를 함께 보관해 프로젝트 결과물과 과정을 한 번에 확인할 수 있습니다.",
    finalDate: "2026-04-29",
    tags: ["AI", "Smart Farm", "Simulation"],
    techStack: ["Python", "Data Analysis", "React"],
    organization: "통합 연구 프로젝트",
    role: "기획, 데이터 분석, UI 설계",
    result: "발표 자료와 최종 보고서 완성",
    links: { github: "https://github.com/", demo: "https://vercel.com/" },
    thumbnailUrl: "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isPublic: true,
    files: [
      { id: "file-smart-farm-report", entryId: "project-smart-farm", fileName: "smart-farm-report.pdf", fileLabel: "최종 보고서", fileType: "PDF", mimeType: "application/pdf", fileSize: 1800000, storagePath: "mock/smart-farm-report.pdf", publicUrl: "#", createdAt: "2026-04-29T00:00:00Z" },
      { id: "file-smart-farm-slides", entryId: "project-smart-farm", fileName: "smart-farm-presentation.pptx", fileLabel: "발표 자료", fileType: "PPTX", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileSize: 2450000, storagePath: "mock/smart-farm-presentation.pptx", publicUrl: "#", createdAt: "2026-04-29T00:00:00Z" }
    ],
    createdAt: "2026-04-29T00:00:00Z",
    updatedAt: "2026-04-29T00:00:00Z"
  },
  {
    id: "research-embedding",
    ownerId: "user-a",
    type: "research",
    title: "Embedding 기반 추천 시스템 분석",
    summary: "추천 시스템에서 임베딩 벡터가 사용자 취향과 콘텐츠 관계를 표현하는 방식을 정리했습니다.",
    description: "K-means, PCA, t-SNE 개념을 적용해 콘텐츠가 벡터 공간에서 어떻게 군집화되는지 분석하고 보고서로 정리했습니다.",
    finalDate: "2026-03-20",
    tags: ["Embedding", "Recommendation", "Machine Learning"],
    techStack: ["Python", "Machine Learning"],
    organization: "진로 탐구 연구",
    role: "자료 조사, 분석, 보고서 작성",
    result: "연구 보고서 완성",
    links: { notion: "https://notion.so/" },
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isPublic: true,
    files: [
      { id: "file-embedding-report", entryId: "research-embedding", fileName: "embedding-research.pdf", fileLabel: "연구 보고서", fileType: "PDF", mimeType: "application/pdf", fileSize: 980000, storagePath: "mock/embedding-research.pdf", publicUrl: "#", createdAt: "2026-03-20T00:00:00Z" }
    ],
    createdAt: "2026-03-20T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z"
  },
  {
    id: "activity-python-study",
    ownerId: "user-b",
    type: "activity",
    title: "Python 알고리즘 스터디",
    summary: "자료구조와 알고리즘 문제 풀이를 꾸준히 기록한 학습 활동입니다.",
    description: "주차별 풀이 기록, 회고, 어려웠던 개념을 정리하며 문제 해결 과정을 포트폴리오 자료로 보관했습니다.",
    finalDate: "2026-02-14",
    tags: ["Algorithm", "Study", "Problem Solving"],
    techStack: ["Python"],
    organization: "교내 자율 동아리",
    role: "문제 풀이 발표, 기록 정리",
    result: "총 24개 문제 풀이 기록",
    links: { github: "https://github.com/" },
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    isFeatured: false,
    isPublic: true,
    files: [
      { id: "file-python-study-zip", entryId: "activity-python-study", fileName: "algorithm-notes.zip", fileLabel: "풀이 압축 파일", fileType: "ZIP", mimeType: "application/zip", fileSize: 1500000, storagePath: "mock/algorithm-notes.zip", publicUrl: "#", createdAt: "2026-02-14T00:00:00Z" }
    ],
    createdAt: "2026-02-14T00:00:00Z",
    updatedAt: "2026-02-14T00:00:00Z"
  },
  {
    id: "award-ai-contest",
    ownerId: "user-b",
    type: "award",
    title: "AI 아이디어 공모전 우수상",
    summary: "학습 데이터를 활용한 개인 맞춤형 진로 추천 아이디어로 수상했습니다.",
    description: "문제 정의, 데이터 활용 시나리오, 서비스 화면 설계를 포함한 제안서를 제출했고 우수상을 받았습니다.",
    finalDate: "2026-01-31",
    tags: ["Award", "AI Service", "Career"],
    techStack: ["Figma", "Research"],
    organization: "청소년 AI 아이디어 공모전",
    role: "아이디어 기획, 제안서 작성",
    result: "우수상",
    links: {},
    thumbnailUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isPublic: true,
    files: [
      { id: "file-ai-contest-image", entryId: "award-ai-contest", fileName: "award-certificate.jpg", fileLabel: "상장 이미지", fileType: "IMAGE", mimeType: "image/jpeg", fileSize: 520000, storagePath: "mock/award-certificate.jpg", publicUrl: "#", createdAt: "2026-01-31T00:00:00Z" }
    ],
    createdAt: "2026-01-31T00:00:00Z",
    updatedAt: "2026-01-31T00:00:00Z"
  }
];
