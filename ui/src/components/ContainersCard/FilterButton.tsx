import React, { useState, useRef, useEffect } from 'react';
import styles from './FilterButton.module.scss';

// Type definitions
type ActionType = {
  id: string;
  label: string;
  handler: () => void;
  isApplied: boolean;
};
// TODO MIGHT HAVE TO ADD A ? TO THE END OF ISAPPLIED

interface FilterButtonProps {
  buttonText: string;
  actions: ActionType[];
}

const FilterButton: React.FC<FilterButtonProps> = ({ buttonText, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActions, setSelectedActions] = useState<{ [key: string]: boolean }>({});
  //initiate all actions to true
  // const [selectedActions, setSelectedActions] = useState(
  //   actions.reduce((acc, action) => {
  //     acc[action.id] = true; // Set all actions to true initially
  //     return acc;
  //   }, {} as { [key: string]: boolean })
  // );
  const [appliedActions, setAppliedActions] = useState<{ [key: string]: boolean }>({});
  // defined a previous state variable- this was added retroactively to fix a bug where
  // if the user didn't make any changes in a modal and pressed "Apply Changes" in the
  // app, it would select any unselected boxes
  let prevActionsRef = useRef<{ [key: string]: boolean }>({});

  // useEffect initializes selections of the filter button based on applied actions
  // aka: if CPU% was set to be invisible, clicking the filtration button will have the 
  // "CPU%" checkbox to show up in the modal as unclicked
  useEffect(() => {
    if (isOpen) {
      setSelectedActions({ ...appliedActions })
    }
  }, [isOpen, appliedActions]);

  // sets the state of the button modal to be "open" or "closed"
  const toggleModal = () => {
    console.log("opening modal:", isOpen)
    setIsOpen(!isOpen);
  };

  // handles the state of each checkbox to determine which action has been selected
  const handleCheckboxChange = (id: string) => {
    setSelectedActions({
      ...selectedActions,
      [id]: !selectedActions[id]
    });
  };

  // handles the submit button's actions and executes accordingly
  const handleSubmit = () => {
    // Execute all selected actions
    actions.forEach(action => {
      if (selectedActions[action.id] !== prevActionsRef[action.id]) {
        action.handler();
      }
    });
    // creates state for all the selected actions for future reference the next time the modal is opened
    setAppliedActions({ ...selectedActions })
    // prevActionsRef.current = selectedActions;
    toggleModal();
  };

  return (
    <div className={styles.modalButtonContainer}>
      <button className={styles.primaryButton} onClick={toggleModal}>
        {buttonText}
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Filter Metrics</h2>
              <button className={styles.closeButton} onClick={toggleModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {actions.map((action) => (
                <div className={styles.checkboxItem} key={action.id}>
                  <input
                    type="checkbox"
                    id={action.id}
                    checked={!selectedActions[action.id]}
                    onChange={() => handleCheckboxChange(action.id)}
                  />
                  <label htmlFor={action.id}>{action.label} {appliedActions[action.id]}</label>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={toggleModal}>
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
              >
                Apply Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;