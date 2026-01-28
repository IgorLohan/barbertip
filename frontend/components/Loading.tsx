interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function Loading({ 
  size = 'md', 
  text = 'Carregando...', 
  fullScreen = false,
  overlay = true 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-[9999]'
    : overlay
    ? 'fixed inset-0 flex items-center justify-center z-[9999]'
    : 'flex items-center justify-center min-h-[60vh]';

  const overlayClasses = overlay
    ? 'fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[9998] pointer-events-auto'
    : '';

  return (
    <>
      {overlay && <div className={overlayClasses} />}
      <div className={containerClasses}>
        <div className="text-center bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mx-3 sm:mx-4 z-[10000] max-w-[90vw]">
          <div
            className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-blue-600 border-t-transparent mb-3 sm:mb-4`}
          ></div>
          {text && <p className={`text-gray-600 ${textSizeClasses[size]} text-sm sm:text-base`}>{text}</p>}
        </div>
      </div>
    </>
  );
}
