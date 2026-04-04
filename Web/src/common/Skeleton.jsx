export function HeadlinerSkeleton() {
    return (
        <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#1A0B2E]/50 animate-pulse border border-white/5" style={{ height: "460px" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#13072E] to-transparent" />
            <div className="absolute inset-x-0 bottom-10 px-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-full mb-6" />
                <div className="w-48 h-8 bg-white/5 rounded-full mb-4" />
                <div className="w-32 h-4 bg-white/5 rounded-full mb-8" />
                <div className="flex gap-4">
                    <div className="w-12 h-14 bg-white/5 rounded-2xl" />
                    <div className="w-12 h-14 bg-white/5 rounded-2xl" />
                    <div className="w-12 h-14 bg-white/5 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

export function EventSkeleton({ index }) {
    const staggerClass = index % 2 !== 0 ? "lg:mt-16" : "";
    return (
        <div className={`relative w-full h-[460px] bg-[#1A0B2E]/50 animate-pulse rounded-[2.5rem] rounded-tl-[8rem] border border-white/5 overflow-hidden flex flex-col ${staggerClass}`}>
            <div className="relative h-[55%] w-full bg-white/5 rounded-tl-[8rem]" />
            <div className="flex flex-col justify-between flex-1 p-6 sm:p-8 pt-0 mt-6">
                <div>
                    <div className="w-24 h-5 bg-white/5 rounded-full mb-4" />
                    <div className="w-3/4 h-8 bg-white/5 rounded-lg mb-4" />
                    <div className="w-full h-4 bg-white/5 rounded-md mb-2" />
                    <div className="w-5/6 h-4 bg-white/5 rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                    <div className="w-32 h-4 bg-white/5 rounded-md" />
                    <div className="w-8 h-8 bg-white/5 rounded-full" />
                </div>
            </div>
        </div>
    );
}
