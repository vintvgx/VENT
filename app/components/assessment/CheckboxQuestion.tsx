

// components/onboarding/questions/CheckboxQuestion.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AssessmentQuestion } from '@/types/user/onboardModel';

interface CheckboxQuestionProps {
  question: AssessmentQuestion;
  value: string[] | null;
  onChange: (value: string[]) => void;
}

const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({ question, value, onChange }) => {
  const selectedOptions = value || [];

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(item => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <View style={styles.container}>
      {question.options?.map((option, index) => {
        const isSelected = selectedOptions.includes(option);
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected ? styles.selectedOption : null
            ]}
            onPress={() => toggleOption(option)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View 
                style={[
                  styles.checkbox,
                  isSelected ? styles.checkboxSelected : null
                ]}
              >
                {isSelected && <View style={styles.checkmark} />}
              </View>
            </View>
            <ThemedText style={styles.optionText}>{option}</ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    width: 14,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
});

export default CheckboxQuestion;