import { LoadingSpinner, type LoadingSpinnerProps } from './spinner';

export default function CenteredSpinner(props: LoadingSpinnerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoadingSpinner {...props} />
    </div>
  )
}
