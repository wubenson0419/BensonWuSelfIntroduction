/** 網站上的文案（標題、說明文字、按鈕字） */

export interface SiteCopy {
  contactCta: { title: string; text: string; button: string };
  contactPage: { title: string; subtitle: string; socialLabel: string; sendButton: string };
  photos: { homeTitle: string; homeSub: string; pageTitle: string; pageSub: string };
}

export const COPY: SiteCopy = {
  contactCta: {
    title: "Let's Connect",
    text: "想聊聊，或有任何事情，都歡迎找我。",
    button: "聯絡方式",
  },
  contactPage: {
    title: "Contact",
    subtitle: "有事找我，都可以透過以下方式聯絡。",
    socialLabel: "Find me on",
    sendButton: "Send Emails",
  },
  photos: {
    homeTitle: "Photos",
    homeSub: "隨手拍拍",
    pageTitle: "Photos",
    pageSub: "到處晃晃，隨手拍拍",
  },
};
