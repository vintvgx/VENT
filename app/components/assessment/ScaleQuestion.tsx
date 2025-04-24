

// components/onboarding/questions/ScaleQuestion.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AssessmentQuestion } from '@/types/user/onboardModel';

interface ScaleQuestionProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ question, value, onChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.scaleContainer}>
        {question.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.scaleOption,
              value === option ? styles.selectedScaleOption : null
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            <ThemedText 
              style={[
                styles.scaleText,
                value === option ? styles.selectedScaleText : null
              ]}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  scaleOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    minWidth: '18%',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedScaleOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  scaleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedScaleText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ScaleQuestion;