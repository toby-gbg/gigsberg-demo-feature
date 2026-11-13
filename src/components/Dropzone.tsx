'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Eye, FileText, FolderUp, ImageOff, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ReactDropzone, { DropEvent, DropzoneProps as ReactDropzoneProps } from 'react-dropzone';
import { FieldError } from 'react-hook-form';

import { cn } from '@/lib/cn';
import { getFileExtension, viewInNewTab as openInNewTab } from '@/utils/common';
import { ACCEPTED_IMAGE_FILE_FORMATS_HINT } from '@/constants/file-type';

import { Button } from '@/components/ui/Button';

interface DropzoneProps extends ReactDropzoneProps {
    label?: string | React.ReactNode;
    description?: string;
    hint?: string;
    files?: FileList | File[];
    error?: FieldError;
    size?: 'lg' | 'sm';
    onFileRemove?: (files: File[]) => void;
}

const isHeicFile = (file: File) =>
    file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);

const isImageFile = (file: File) => file.type.startsWith('image/') || isHeicFile(file);

const isPdfFile = (file: File) =>
    file.type === 'application/pdf' || getFileExtension(file).toLowerCase() === '.pdf';

const convertHeicToJpeg = (file: File) => {
    return import('heic2any')
        .then(
            ({ default: heic2any }) =>
                heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8,
                }) as Promise<Blob>
        )
        .catch((error) => {
            console.error('Failed to convert HEIC to JPEG', error);
            throw error;
        });
};

const viewInNewTab = async (file: File) => {
    if (!isHeicFile(file)) {
        openInNewTab(file);
        return;
    }

    const newTab = window.open('', '_blank');
    if (!newTab) return;

    newTab.document.title = 'Loading image...';
    newTab.document.body.innerHTML = `
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center">
            Loading image...
        </div>
    `;

    try {
        const previewBlob = await convertHeicToJpeg(file);
        const previewUrl = URL.createObjectURL(previewBlob);

        newTab.location.replace(previewUrl);

        setTimeout(() => URL.revokeObjectURL(previewUrl), 10000);
    } catch {
        newTab.document.body.textContent = 'Unable to preview this image.';
    }
};

const PdfThumbnail: FC<{ file: File }> = ({ file }) => {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        const objectUrl = URL.createObjectURL(
            file.type === 'application/pdf' ? file : new Blob([file], { type: 'application/pdf' })
        );
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <span className="relative block size-full overflow-hidden" aria-hidden="true">
            {url && (
                <iframe
                    title={file.name}
                    tabIndex={-1}
                    src={`${url}#page=1&view=Fit&toolbar=0&navpanes=0&scrollbar=0`}
                    // Render at a usable PDF viewport, then scale it into the thumbnail.
                    className="pointer-events-none absolute top-0 left-0 h-[1000%] w-[1000%] origin-top-left scale-[0.1] border-0"
                />
            )}
        </span>
    );
};

const FilePreview: FC<{ file: File }> = ({ file }) => {
    const t = useTranslations();
    const [previewUrl, setPreviewUrl] = useState<string>();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let objectUrl: string | undefined;

        const createPreview = async () => {
            setPreviewUrl(undefined);
            setHasError(false);

            try {
                let previewBlob: Blob = file;

                if (isHeicFile(file)) {
                    previewBlob = await convertHeicToJpeg(file);
                }

                objectUrl = URL.createObjectURL(previewBlob);
                setPreviewUrl(objectUrl);
            } catch {
                setHasError(true);
            }
        };

        createPreview();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return (
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
            {previewUrl ? (
                <Image
                    fill
                    unoptimized
                    sizes="56px"
                    src={previewUrl}
                    alt={file.name}
                    className="object-contain hover:cursor-pointer"
                />
            ) : hasError ? (
                <ImageOff className="size-5 text-gray-400" aria-hidden="true" />
            ) : (
                <Loader2 className="size-5 animate-spin text-gray-400" aria-label={t('loading')} />
            )}
        </div>
    );
};

const Dropzone: FC<DropzoneProps> = ({
    description = '',
    label = 'Drop your files',
    hint = ACCEPTED_IMAGE_FILE_FORMATS_HINT,
    files = [],
    error,
    size = 'lg',
    onFileRemove,
    ...props
}) => {
    const t = useTranslations();

    const fileArray = useMemo(() => Array.from(files), [files]);

    const totalSize = useMemo(
        () => fileArray.reduce((acc, file) => acc + file.size, 0),
        [fileArray]
    );

    const formatBytes = (bytes: number): string => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <ReactDropzone {...props}>
            {({ getRootProps, getInputProps }) => (
                <div className="space-y-3">
                    <div
                        {...getRootProps({
                            className: cn(
                                'rounded-lg border border-gray-300 border-dashed py-3 cursor-pointer h-[125px] flex items-center justify-center',
                                error && 'border-danger text-danger',
                                {
                                    'h-[125px]': size === 'lg',
                                    'h-[75px]': size === 'sm',
                                }
                            ),
                        })}
                    >
                        <input {...getInputProps()} />
                        <div className="">
                            <div className="flex items-center justify-center gap-2">
                                <FolderUp size={24} />
                                <span className="font-medium">
                                    {label ||
                                        t.rich('drop_your_tickets_here', {
                                            action: (chunks) => (
                                                <span className="text-[#1867C3] underline">
                                                    {chunks}
                                                </span>
                                            ),
                                        })}
                                </span>
                            </div>
                            <div className={cn('text-xs text-gray-500', error && 'text-danger')}>
                                {description}
                            </div>
                            {hint && <span className="text-xs text-gray-500">{hint}</span>}
                        </div>
                    </div>

                    {error?.message && <p className="text-sm text-red-600">{error.message}</p>}

                    {fileArray.length > 0 && (
                        <div className="space-y-1 text-sm text-gray-800">
                            <div className="font-semibold">
                                {fileArray.length} {t('file')}
                                {fileArray.length > 1 ? 's' : ''} — {t('total')}:{' '}
                                {formatBytes(totalSize)}
                            </div>
                            <ul className="space-y-1">
                                {fileArray.map((file, i) => {
                                    const isPdfOrImage = isPdfFile(file) || isImageFile(file);
                                    return (
                                        <li
                                            key={i}
                                            className="border-border flex min-h-20 flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <button
                                                    type="button"
                                                    aria-label={`${t('view')} ${file.name}`}
                                                    className="size-14 shrink-0 overflow-hidden rounded bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                                                    onClick={() => viewInNewTab(file)}
                                                >
                                                    {isImageFile(file) ? (
                                                        <FilePreview file={file} />
                                                    ) : isPdfFile(file) ? (
                                                        <PdfThumbnail file={file} />
                                                    ) : (
                                                        <span className="flex size-full flex-col items-center justify-center gap-1 text-gray-500">
                                                            <FileText
                                                                className="size-5"
                                                                aria-hidden="true"
                                                            />
                                                            <span className="text-xs font-medium">
                                                                {getFileExtension(file)
                                                                    .slice(1)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </span>
                                                    )}
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        className={cn(
                                                            'truncate',
                                                            isPdfOrImage &&
                                                                'hover:cursor-pointer hover:underline'
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isPdfOrImage) viewInNewTab(file);
                                                        }}
                                                    >
                                                        {file.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatBytes(file.size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    type="button"
                                                    aria-label={`${t('delete')} ${file.name}`}
                                                    className="size-8 p-0 hover:cursor-pointer"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        const newFiles = fileArray.filter(
                                                            (curFile) => curFile !== file
                                                        );
                                                        props.onDrop?.(
                                                            newFiles,
                                                            [],
                                                            e as unknown as DropEvent
                                                        );
                                                        onFileRemove?.(newFiles);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    aria-label={`${t('view')} ${file.name}`}
                                                    variant="outline"
                                                    className="h-8 px-3 py-1.5"
                                                    onClick={() => {
                                                        viewInNewTab(file);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                    {t('view')}
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </ReactDropzone>
    );
};

export default Dropzone;
