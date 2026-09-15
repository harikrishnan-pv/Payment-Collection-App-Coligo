import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { CustomerDto } from "@coligo/shared";
import { LoanCard } from "../components/LoanCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { spacing, type } from "../theme";

type DetailsScreenProps = {
  customer: CustomerDto;
  onPay: (customer: CustomerDto) => void;
  onHistory: (customer: CustomerDto) => void;
};

/** Loan details + entry points to payment and history. */
export function DetailsScreen({ customer, onPay, onHistory }: DetailsScreenProps) {
  return (
    <ScrollView contentContainerStyle={spacing.screen}>
      <LoanCard customer={customer} />
      <View style={spacing.stack24} />
      <Text style={type.subtitle}>What would you like to do?</Text>
      <View style={spacing.stack12} />
      <PrimaryButton
        label="Pay EMI"
        onPress={() => onPay(customer)}
        testID="pay-emi-button"
      />
      <View style={spacing.stack12} />
      <PrimaryButton
        label="Payment history"
        onPress={() => onHistory(customer)}
        variant="secondary"
        testID="history-button"
      />
    </ScrollView>
  );
}
