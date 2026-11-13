export interface FooterCredits {
    imageCredits?: string | null;
    imageSource?: string | null;
}

export interface FooterCommonCredits {
    slides?: FooterCredits[];
    events?: FooterCredits[];
    performers?: FooterCredits[];
    entities?: FooterCredits[];
    fansAlsoLikePerformers?: FooterCredits[];
}
