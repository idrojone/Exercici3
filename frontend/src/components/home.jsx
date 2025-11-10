function Home() {
    return (
        <main className="h-screen w-full grid grid-cols-2 grid-rows-2 p-0 m-0 overflow-hidden bg-green-100">
            <h2 className="flex items-center justify-center text-5xl sm:text-7xl text-center p-4">
                Toca césped 🌱
            </h2>
            <img className="w-full h-full object-cover" src="../src/assets/plantita2.jpg" alt="img1" />
            <img className="w-full h-full object-cover" src="../src/assets/plantita.webp" alt="img2" />
            <img className="w-full h-full object-cover" src="../src/assets/plantita.jpg" alt="img3" />
        </main>
    )
}
export default Home;