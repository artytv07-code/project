type ProgressIndicatorProps = {
  current: number;
  visible: boolean;
};

export function ProgressIndicator({
  current,
  visible,
}: ProgressIndicatorProps) {
  return (
    <div
      className={`progress ${visible ? 'progress--visible' : ''}`}
      aria-hidden="true"
    >
      <span className="progress__line" />
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={[
            'progress__dot',
            step < current ? 'is-past' : '',
            step === current ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </div>
  );
}
