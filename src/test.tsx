const PrintName = ({ name }: { name: string }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
    </div>
  );
};

export const printName = (name: string) => <PrintName name={name} />;
