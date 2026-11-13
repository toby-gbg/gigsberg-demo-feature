import dynamic from 'next/dynamic';

const HeaderSearchBar = dynamic(() => import('./HeaderSearchBar'));

const MainSearch = () => {
    return (
        <div data-ddv-hide-during-fullscreen className="xl:flex-1 p-2 xl:p-0 w-full shrink-0">
            <HeaderSearchBar />
        </div>
    );
};

export default MainSearch;
