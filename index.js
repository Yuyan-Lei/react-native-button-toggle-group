import * as React from "react";
import { Animated, View, Text, StyleSheet, Platform } from "react-native";
import { TouchableRipple } from "react-native-paper";
import MaskedView from "@react-native-masked-view/masked-view";


const ButtonToggleGroup = ({
	values,
	value,
	onSelect,
	style,
	highlightBackgroundColor,
	highlightTextColor,
	inactiveBackgroundColor,
	inactiveTextColor,
	textStyle = {},
}) => {
	const [prevSelectedIndex, setPrevSelectedIndex] = React.useState(0);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const selectedPanelLeft = React.useRef(new Animated.Value(0));

	const widthSize = 100 / values.length;

	const interpolatedValuesInput = values.map((_, i) => {
		return widthSize * i;
	});

	const interpolatedValuesOutput = values.map((_, i) => {
		return `${widthSize * i}%`;
	});

	React.useEffect(() => {
		const left = widthSize * selectedIndex;

		Animated.timing(selectedPanelLeft.current, {
			toValue: left,
			duration: 300,
			useNativeDriver: false,
		}).start(() => {
			setPrevSelectedIndex(selectedIndex);
		});
	}, [widthSize, selectedPanelLeft, selectedIndex]);

	React.useEffect(() => {
		const newIndex = values.findIndex((v) => v === value);
		setPrevSelectedIndex(selectedIndex);
		setSelectedIndex(newIndex);
	}, [values, value, selectedIndex]);

	// This allows the text to render under the related animation while the mask is gliding across
	// Notice the `.start(setPrevIndex)` to reset the previous index once the animation has stabilized
	const maxIndex =
		selectedIndex > prevSelectedIndex ? selectedIndex : prevSelectedIndex;
	const minIndex =
		selectedIndex > prevSelectedIndex ? prevSelectedIndex : selectedIndex;

	const highlightMask = {
		backgroundColor: highlightBackgroundColor,
	};

	const highlightText = {
		color: highlightTextColor,
	};

	const inactiveText = {
		color: inactiveTextColor,
	};

	const inactiveBackground = {
		backgroundColor: inactiveBackgroundColor,
	};

	/**
	 * For whatever reason, the `zIndex: -1` on Text works on Android, but does not work
	 * on iOS. However, when we can get away with only removing the Text from zIndex,
	 * the ripple effect continues to work on Android. As such, we conditionally
	 * apply the logic for Android vs iOS
	 */
	const inactiveContainerIOS = { zIndex: -1 };

	return (
		<View
			style={[styles.container, style]}
			accessible
			accessibilityRole="radiogroup"
		>
			<MaskedView
				importantForAccessibility={"no-hide-descendants"}
				accessibilityElementsHidden={true}
				key={selectedIndex}
				style={styles.maskViewContainer}
				androidRenderingMode={"software"}
				maskElement={
					<Animated.View
						style={[
							styles.blueMaskContainer,
							{
								width: `${widthSize}%`,
								left: selectedPanelLeft.current.interpolate({
									inputRange: interpolatedValuesInput,
									outputRange: interpolatedValuesOutput,
								}),
							},
						]}
					/>
				}
			>
				<View style={[styles.baseButtonContainer, highlightMask]}>
					{values.map((value, i) => (
						<TouchableRipple
							key={i}
							onPress={() => {
								setSelectedIndex(i);
								onSelect(values[i]);
							}}
							style={styles.baseTouchableRipple}
						>
							<Text
								style={[
									styles.baseButtonText,
									styles.highlightText,
									textStyle,
									highlightText,
								]}
								numberOfLines={1}
							>
								{value}
							</Text>
						</TouchableRipple>
					))}
				</View>
			</MaskedView>
			<View
				style={[
					styles.baseButtonContainer,
					styles.inactiveButtonContainer,
					inactiveContainerIOS,
				]}
			>
				{values.map((value, i) => (
					<TouchableRipple
						accessibilityRole="radio"
						accessibilityState={{ checked: selectedIndex === i }}
						accessibilityLiveRegion="polite"
						key={i}
						style={[
							styles.baseTouchableRipple,
							{
								zIndex: minIndex <= i && maxIndex >= i ? -1 : 0,
							},
							inactiveBackground,
						]}
						onPress={() => {
							setSelectedIndex(i);
							onSelect(values[i]);
						}}
					>
						<Text
							style={[styles.baseButtonText, textStyle, inactiveText]}
							numberOfLines={1}
						>
							{value}
						</Text>
					</TouchableRipple>
				))}
			</View>
		</View>
	);
};

export default ButtonToggleGroup;

const styles = StyleSheet.create({
	container: {
		height: 38,
		position: "relative",
		borderRadius: 12,
	},
	maskViewContainer: {
		width: "100%",
		height: "100%",
		position: "relative",
	},
	blueMaskContainer: {
		position: "absolute",
		backgroundColor: "black",
		borderRadius: 10,
		height: "100%",
		
	},
	baseButtonContainer: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "nowrap",
		justifyContent: "space-around",
		alignItems: "center",
		borderRadius: 10,
	},
	inactiveButtonContainer: {
		position: "absolute",
		width: "100%",
		height: "100%",
		borderRadius: 10,
	},
	baseTouchableRipple: {
		height: "100%",
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
		marginHorizontal: 5,

		shadowColor: '#ADADAD',
		shadowRadius: 4,
		shadowOpacity: 0.3,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 18,
	},
	baseButtonText: {
		fontSize: 14,
		color: 'rgba(46, 37, 37, 0.43)',
	},
	highlightText: {
		zIndex: 1,
		color: 'white',
		fontSize: 15,
	},
});
