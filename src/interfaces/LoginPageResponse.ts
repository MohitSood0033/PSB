export type ThoughtsData = {
    en: string;
    thinker_en: string;
    hi: string;
    thinker_hi: string;
}
  
export type LoginPageResponse = {
    status_code: string;
    message: string;
    data: {
        thoughts: ThoughtsData;
        slider: string[];
    };
}