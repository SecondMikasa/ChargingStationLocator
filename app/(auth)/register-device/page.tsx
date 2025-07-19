export default function RegisterDevicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Register Your EV Device</h1>
          <p className="text-muted-foreground">
            Link your ESP32 device to start monitoring your battery
          </p>
        </div>
        
        <div className="rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Device registration form will be implemented in the next task.
          </p>
        </div>
      </div>
    </div>
  );
}