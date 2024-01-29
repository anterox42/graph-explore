import Link from 'next/link';
import capitalizeFirstLetter from './[branch]/helpers/capitalizeFirstLetter';

const branches = ['angular', 'dart', 'flutter', 'java', 'laravel', 'python', 'react'];

function Node({ branch }: { branch: string }) {
  return (
    <Link href={`/${branch}`}>
      <div className="flex items-center justify-center h-32 lg:h-44 w-32 lg:w-44 m-6 lg:m-8 text-m lg:text-lg bg-white rounded-full cursor-pointer focus-scale text-center">
        {capitalizeFirstLetter(branch)}{' '}
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="p-2 lg:p-10">
      <header>
        <h1 className="text-white text-4xl text-center p-5">Select domain</h1>
      </header>
      <main className="flex items-center justify-center flex-wrap">
        {branches.map((branch) => (
          <Node key={branch} branch={branch} />
        ))}
      </main>
    </div>
  );
}
