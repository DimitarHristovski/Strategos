/** Shown briefly while battle units are not yet initialized. */
export function FormationLoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'linear-gradient(rgba(20, 15, 10, 0.55), rgba(20, 15, 10, 0.68)), url("/gamebkg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="text-white text-xl">Loading formation...</div>
    </div>
  );
}
