# 스토어 메타데이터 (fastlane)

집값노트의 App Store / Google Play 등록용 메타데이터입니다. `fastlane deliver`(iOS) / `fastlane supply`(Android)가 이 구조를 그대로 읽어 업로드합니다.

## 디렉토리 구조

```
fastlane/metadata/
├── ios/ko/
│   ├── name.txt              # 앱 이름
│   ├── subtitle.txt          # 부제
│   ├── keywords.txt          # ASO 키워드(쉼표 구분)
│   ├── promotional_text.txt  # 프로모션 텍스트(수시 변경 가능)
│   ├── description.txt        # 앱 설명
│   └── release_notes.txt     # 이번 버전 변경사항
└── android/ko-KR/
    ├── title.txt             # 앱 제목
    ├── short_description.txt  # 짧은 설명
    ├── full_description.txt   # 전체 설명
    └── changelogs/default.txt # 변경사항(버전 기본값)
```

## 파일별 용도 및 글자수 제한

| 플랫폼 | 파일 | 용도 | 제한 |
|--------|------|------|------|
| iOS | `name.txt` | 앱 이름(홈/스토어 표시) | 30자 이내 |
| iOS | `subtitle.txt` | 이름 아래 한 줄 부제 | 30자 이내 |
| iOS | `keywords.txt` | 검색 키워드(쉼표 구분, 공백 불필요) | **100자 이내(쉼표 포함)** |
| iOS | `promotional_text.txt` | 앱 상단 프로모션 문구(심사 없이 수정 가능) | 170자 이내 |
| iOS | `description.txt` | 앱 상세 설명 | 4000자 이내 |
| iOS | `release_notes.txt` | 버전 릴리즈 노트 | 4000자 이내 |
| Android | `title.txt` | 앱 제목 | 30자 이내 |
| Android | `short_description.txt` | 짧은 설명 | 80자 이내 |
| Android | `full_description.txt` | 전체 설명 | 4000자 이내 |
| Android | `changelogs/default.txt` | 변경사항 | **500 bytes 이내(Google Play API 엄수)** |

## 주의

- **Android `changelogs/default.txt`는 500 bytes 제한**입니다. 한글은 UTF-8에서 글자당 3바이트이므로 글자수가 아닌 바이트 기준으로 확인하세요: `wc -c fastlane/metadata/android/ko-KR/changelogs/default.txt`.
- iOS `keywords.txt`는 쉼표 포함 100자 이내이며, 키워드 사이 공백을 넣지 않아야 글자수를 아낄 수 있습니다.
- 앱 이름(`name.txt` / `title.txt`)은 `app.config.ts`의 `withLocalizedAppName`(홈 화면 이름)과 동일해야 합니다(집값노트).
- 평점 점수 유도("5점 부탁") 등 가이드라인 위반 문구, 과장·허위 표현을 넣지 않습니다.
