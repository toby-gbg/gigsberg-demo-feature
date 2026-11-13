interface JsonLdScriptProps<D> {
    id: string;
    jsonLd: D;
}

export default function JsonLdScript<D>({ jsonLd, id }: JsonLdScriptProps<D>) {
    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
