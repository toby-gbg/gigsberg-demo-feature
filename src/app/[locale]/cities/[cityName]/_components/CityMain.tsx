'use client';

import { FC, Fragment } from 'react';

import { EventTicketByCity } from '@/interfaces/Event';
import { EventsByCityResponse } from '@/interfaces/Fetch';

import MainContainer from '@/components/MainContainer';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

import CityBody from './CityBody';
import CityEmpty from './CityEmpty';
import CityHeader from './CityHeader';

interface CitiesProps {
    data: EventsByCityResponse<EventTicketByCity>[];
}

const CityMain: FC<CitiesProps> = ({ data }) => {
    const filteredData = data.filter(
        (typeData) => typeData?.events && typeData?.events?.length > 0
    );

    return (
        <div className="flex flex-col gap-y-5">
            <CityHeader />
            {data.every((typeData) => !typeData?.events || typeData?.events?.length === 0) ? (
                <CityEmpty />
            ) : (
                <MainContainer className="my-10">
                    {filteredData.map((typeData, index) => {
                        const isNotLast = index < filteredData.length - 1;
                        if (!typeData?.events || typeData?.events?.length === 0) {
                            return null; // Skip rendering if there are no events for this type
                        }
                        return (
                            <Fragment key={typeData.name}>
                                <CityBody typeData={typeData} />
                                {isNotLast && <hr className="border-default-200 mb-6" />}
                            </Fragment>
                        );
                    })}
                </MainContainer>
            )}
            <MainContainer className="mb-10">
                <TrustBenefitStrip />
            </MainContainer>
        </div>
    );
};

export default CityMain;
