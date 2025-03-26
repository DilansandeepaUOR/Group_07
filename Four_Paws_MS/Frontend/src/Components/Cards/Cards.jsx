export function Cards({ name, image }) {
return (
    <div className="relative grid h-[40rem] w-full max-w-[28rem] items-end justify-center overflow-hidden text-center shadow-none group cursor-pointer transition-transform duration-300 transform hover:scale-105 hover:shadow-[0_10px_20px_rgba(105,255,154,0.5)]">
        <div
            className="absolute inset-0 m-0 h-full w-full rounded-none bg-cover bg-center transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundImage: `url(${image})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="relative py-14 px-6 md:px-12 transition-transform duration-300 group-hover:font-bold hover:text-2xl">
            <h2 className="mb-6 font-medium leading-[1.5] text-white">{name}</h2>
        </div>
    </div>
);
}

export default Cards;
