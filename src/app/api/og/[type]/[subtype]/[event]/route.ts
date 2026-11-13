import React from 'react';
import { ImageResponse } from 'next/og';
import fs from 'fs/promises';
import sharp from 'sharp';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { removeTicketsSuffix } from '@/utils/common';
import { entityApi } from '@/services/server/entity';

export const size = {
    width: 1200,
    height: 628,
};

export const contentType = 'image/png';

//===================================================================
//=============================HELPERS===============================
//===================================================================
const getImageBuffer = async (src: string) => {
    let base64 = '';
    try {
        const res = await fetch(src);

        const arrayBuffer = await res.arrayBuffer();

        const pngBuffer = await sharp(Buffer.from(arrayBuffer))
            .resize({
                width: 300,
            })
            .jpeg({
                quality: 80,
                mozjpeg: true,
            })
            .png()
            .toBuffer();

        base64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (e) {
        console.error('Failed to get image from server!', e);
        return null;
    }

    return base64;
};

const generateImageElement = (src: string) => {
    const entityImage = React.createElement('img', {
        src,
        style: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
        },
    });

    return entityImage;
};

const getBackgroundSrc = (type: string, event?: string) => {
    if (event && /world[-_ ]?cup/i.test(event)) {
        return 'public/og/sport-wc_single_team.jpg';
    }

    switch (removeTicketsSuffix(type)) {
        case 'sport': {
            return 'public/og/sport-single_team.jpg';
        }
        default: {
            return 'public/og/concert.jpg';
        }
    }
};

//===================================================================
//=============================CONTENT===============================
//===================================================================
const generateBackgroundImageElement = async (type: string, event?: string) => {
    //Fetch template image from public folder to use as background image
    const imgSrc = getBackgroundSrc(type, event);
    const imgBuffer = await fs.readFile(imgSrc);

    const backgroundElement = React.createElement('img', {
        src: `data:image/jpeg;base64,${imgBuffer.toString('base64')}`,
        style: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
    });

    return backgroundElement;
};

const generateMainContent = async (type: string, entityMetadata: EntityMetadata | null) => {
    if (!entityMetadata) {
        return React.createElement('div');
    }

    const { entity, type: entityType } = entityMetadata;
    const hasLongTitle = entity.name.length >= 50;

    const imageUrl = entity.image
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${entityType}s/${entity.image}`
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${entity.subtypeImage}`;
    const imageSrc = await getImageBuffer(imageUrl);

    switch (removeTicketsSuffix(type)) {
        case 'sport': {
            const entityImageElement = imageSrc
                ? React.createElement(
                      'div',
                      {
                          style: {
                              border: '4px solid white',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              maxHeight: '320px',
                              maxWidth: '320px',
                          },
                      },
                      generateImageElement(imageSrc)
                  )
                : React.createElement('div');

            const content = React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'center',
                        position: 'relative',
                        top: '-40px',
                    },
                },
                entityImageElement,
                entity.name
            );

            return content;
        }
        default: {
            const entityImageElement = imageSrc
                ? React.createElement(
                      'div',
                      {
                          style: {
                              border: '4px solid white',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              maxHeight: '600px',
                              maxWidth: '500px',
                              marginLeft: 'auto',
                          },
                      },
                      generateImageElement(imageSrc)
                  )
                : React.createElement('div');

            const content = React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        padding: '40px',
                    },
                },
                React.createElement(
                    'div',
                    {
                        style: {
                            fontSize: hasLongTitle ? '40px' : '54px',
                            position: 'absolute',
                            bottom: hasLongTitle ? '350px' : '370px',
                            width: '600px',
                            height: 'auto',
                        },
                    },
                    entity.name
                ),
                entityImageElement
            );

            return content;
        }
    }
};

//===================================================================
//=========================MAIN ENDPOINT=============================
//===================================================================
/**
 * We need to generate dynamically for pages with type `sport` and `concert`
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ type: string; subtype: string; event: string }> }
) {
    const { type, subtype, event } = await params;
    const [normalizedEvent] = event.split('.png');

    try {
        const metadata = await entityApi.getEntityMetadata({ url: normalizedEvent, type, subtype });

        const backgroundElement = await generateBackgroundImageElement(type, normalizedEvent);
        const contentElement = await generateMainContent(type, metadata);

        return new ImageResponse(
            React.createElement(
                'div',
                {
                    style: {
                        fontSize: 80,
                        color: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                },
                backgroundElement,
                contentElement
            ),
            {
                ...size,
            }
        );
    } catch (e) {
        console.error('OG response generation failed!', e);

        return new Response('Failed to generate image', {
            status: 500,
        });
    }
}
