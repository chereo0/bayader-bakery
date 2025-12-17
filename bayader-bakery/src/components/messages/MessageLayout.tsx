import React from 'react';

interface MessageLayoutProps {
    children: [React.ReactNode, React.ReactNode];
    mobileShowDetail: boolean;
}

export const MessageLayout: React.FC<MessageLayoutProps> = ({ children, mobileShowDetail }) => {
    const [listComponent, detailComponent] = children;

    return (
        <div className="flex h-[calc(100vh-100px)] lg:h-[700px] bg-white rounded-lg shadow-sm border border-[#f3e7d9] overflow-hidden">
            {/* List Panel */}
            <div
                className={`w-full lg:w-[35%] border-r border-[#f3e7d9] flex flex-col transition-transform duration-300 ease-in-out absolute lg:relative z-10 lg:z-auto h-full bg-white lg:translate-x-0 ${mobileShowDetail ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
                    }`}
            >
                {listComponent}
            </div>

            {/* Detail Panel */}
            <div
                className={`w-full lg:w-[65%] flex flex-col transition-transform duration-300 ease-in-out absolute lg:relative z-20 lg:z-auto h-full bg-white lg:translate-x-0 ${mobileShowDetail ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}
            >
                {detailComponent}
            </div>
        </div>
    );
};
