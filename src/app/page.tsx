import Button from "@/components/ui/Button";

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="text-red-500">hello</p>
                <Button>Button</Button>
            </div>
        </main>
    );
}
