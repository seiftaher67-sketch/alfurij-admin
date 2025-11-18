import React, { useState } from 'react';
import { clsx } from 'clsx';

const SelectContext = React.createContext();

const Select = React.forwardRef(({ children, className, onValueChange, value, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) onValueChange(newValue);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <SelectContext.Provider value={{ selectedValue, handleValueChange, isOpen, toggleOpen }}>
      <div className={clsx("relative", className)} ref={ref} {...props}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { isOpen, toggleOpen })
        )}
      </div>
    </SelectContext.Provider>
  );
});

Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, isOpen, toggleOpen, ...props }, ref) => (
  <button
    type="button"
    className={clsx(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    ref={ref}
    onClick={toggleOpen}
    {...props}
  >
    {children}
    <svg className={clsx("h-4 w-4 opacity-50", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
));

SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { selectedValue } = React.useContext(SelectContext);
  const selectedLabel = placeholder; // For simplicity, using placeholder. In real implementation, map value to label.

  return (
    <span
      className={clsx("truncate", className)}
      ref={ref}
      {...props}
    >
      {selectedValue || placeholder}
    </span>
  );
});

SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, children, isOpen, ...props }, ref) => (
  <div
    className={clsx(
      "absolute top-full mt-1 z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md",
      !isOpen && "hidden",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </div>
));

SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { handleValueChange, selectedValue } = React.useContext(SelectContext);

  return (
    <div
      className={clsx(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === value && "bg-gray-100",
        className
      )}
      ref={ref}
      onClick={() => handleValueChange(value)}
      {...props}
    >
      {children}
    </div>
  );
});

SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
