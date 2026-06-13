# 개인정보처리방침 호스팅 (GitHub Pages)

이 디렉토리(`docs/privacy/index.html`)는 집값노트의 개인정보처리방침 정적 페이지입니다. App Store / Google Play 심사에 제출할 공개 URL을 GitHub Pages로 무료 게시합니다.

## GitHub Pages 활성화 절차

1. 이 저장소를 GitHub에 푸시한다(브랜치: `main`).
2. GitHub 저장소 → **Settings** → **Pages** 이동.
3. **Build and deployment** → **Source**를 `Deploy from a branch`로 선택.
4. **Branch**를 `main`, 폴더를 **`/docs`** 로 선택한 뒤 **Save**.
5. 1~2분 뒤 게시되며, 결과 URL은 `https://<GitHub사용자명>.github.io/<저장소명>/privacy/` 형태가 된다 (예: `https://zihado.github.io/expo-demo/privacy/`). 이 URL을 `app.config.ts`의 개인정보처리방침 링크 자리와 App Store Connect / Play Console의 "개인정보처리방침 URL" 필드에 입력하고, 게시 전 반드시 `index.html` 하단의 `[YOUR_EMAIL]` 자리를 실제 문의 이메일로 교체한다.
