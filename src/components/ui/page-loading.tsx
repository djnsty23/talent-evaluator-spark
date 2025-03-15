
import { Spinner } from './spinner';

interface PageLoadingProps {
  message?: string;
}

const PageLoading = ({ message = "Loading content..." }: PageLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Spinner size="xl" label={message} className="flex-col gap-4" />
    </div>
  );
};

export { PageLoading };
