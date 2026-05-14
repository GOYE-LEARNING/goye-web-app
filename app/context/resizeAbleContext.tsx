import React, {
  createContext,
  useContext,
  useState,
} from "react";
interface Props {
  elementHeight: number;
  setELementHeight: React.Dispatch<React.SetStateAction<number>>;
}

const ResizeContext = createContext<Props | undefined>(undefined);

export default function ResizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [elementHeight, setELementHeight] = useState<number>(0);
  return (
    <ResizeContext.Provider value={{ elementHeight, setELementHeight }}>
      {children}
    </ResizeContext.Provider>
  );
}

export const useResizable = () => {
  const useResizable = useContext(ResizeContext);

  if (useResizable === undefined) {
    throw Error("Resiable Context must be used within a provider.");
  }

  return useResizable;
};
