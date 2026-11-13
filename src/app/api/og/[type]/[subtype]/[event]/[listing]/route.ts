import React from 'react';
import { ImageResponse } from 'next/og';
import fs from 'fs/promises';
import sharp from 'sharp';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { EventMetadata } from '@/interfaces/Metadata';
import { removeTicketsSuffix } from '@/utils/common';
import { entityApi } from '@/services/server/entity';
import { eventApi } from '@/services/server/events';

async function loadGoogleFont(font: string, weight: number) {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`).then(
        (res) => res.text()
    );

    const match = css.match(/src: url\((.+)\) format\('(opentype|truetype|woff|woff2)'\)/);

    if (!match) {
        throw new Error('Failed to load font');
    }

    const fontUrl = match[1];

    return fetch(fontUrl).then((res) => res.arrayBuffer());
}

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

const generateTeamNameElement = (teamA: string, teamB: string | null) => {
    const teamAElement = React.createElement(
        'div',
        {
            style: {
                fontWeight: 'bold',
            },
        },
        teamA
    );

    const teamBElement = React.createElement(
        'div',
        {
            style: {
                fontWeight: 'bold',
            },
        },
        teamB
    );

    const element = React.createElement(
        'div',
        {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
            },
        },
        teamAElement,
        teamB ? 'vs' : '',
        teamBElement
    );

    return element;
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

const generateMainContent = async (
    type: string,
    entityMetadata: EntityMetadata | null,
    eventMetadata: EventMetadata | null
) => {
    if (!entityMetadata) {
        return React.createElement('div');
    }

    const { entity } = entityMetadata;
    const hasLongTitle = (eventMetadata?.event_name.length || 0) >= 50;

    const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${entityMetadata.type}s/${entity.image}`;
    const imageSrc = await getImageBuffer(imageUrl);

    switch (removeTicketsSuffix(type)) {
        case 'sport': {
            const eventName = eventMetadata?.event_name || '';
            const [teamA, teamB] = eventName.split(/\s+vs\s+/i);

            const content = React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'center',
                        position: 'relative',
                        top: '-80px',
                    },
                },
                React.createElement(
                    'div',
                    {
                        style: {
                            fontSize: '60px',
                            position: 'relative',
                            display: 'flex',
                            fontFamily: 'Poppins',
                            textAlign: 'center',
                        },
                    },
                    generateTeamNameElement(teamA.trim(), teamB?.trim())
                )
            );

            return content;
        }
        default: {
            const entityImageElement = imageSrc
                ? React.createElement(
                      'div',
                      {
                          style: {
                              position: 'relative',
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
                            bottom: hasLongTitle ? '370px' : '380px',
                            width: '600px',
                            height: 'auto',
                        },
                    },
                    eventMetadata?.event_name
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
    {
        params,
    }: { params: Promise<{ type: string; subtype: string; event: string; listing: string }> }
) {
    const { type, subtype, event, listing } = await params;
    const [normalizedListing] = listing.split('.png');

    try {
        const [metadata, eventMetadata] = await Promise.all([
            entityApi.getEntityMetadata({ url: event, type, subtype }),
            eventApi.getEventMetadata({ query: normalizedListing, type, subtype, event }),
        ]);

        const backgroundElement = await generateBackgroundImageElement(
            type,
            eventMetadata?.tour_name
        );
        const contentElement = await generateMainContent(type, metadata, eventMetadata);

        const poppins500 = await loadGoogleFont('Poppins', 500);
        const poppins700 = await loadGoogleFont('Poppins', 700);

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
                fonts: [
                    {
                        name: 'Poppins',
                        data: poppins500,
                        weight: 500,
                        style: 'normal',
                    },
                    {
                        name: 'Poppins',
                        data: poppins700,
                        weight: 700,
                        style: 'normal',
                    },
                ],
            }
        );
    } catch (e) {
        console.error('OG response generation failed!', e);

        return new Response('Failed to generate image', {
            status: 500,
        });
    }
}
