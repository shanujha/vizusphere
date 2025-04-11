# VizuSphere - Interactive Word Visualization

VizuSphere is an elegant web application for creating interactive, circle-based word visualizations. Transform your data into beautiful, draggable circles with sizes proportional to their values to create engaging visual representations.

![VizuSphere Screenshot](https://placeholder-for-screenshot.com)

## Features

- **Interactive Visualization**: Drag and position word circles to create custom layouts
- **Dynamic Sizing**: Circle size automatically adjusts based on the data values
- **Beautiful Design**: Modern UI with smooth animations and a clean aesthetic
- **Customizable**: Easy data input through JSON format
- **Export Capability**: Save your visualizations as transparent PNG images
- **Responsive**: Works across desktop and mobile devices

## How to Use

1. Open `index.html` in your web browser
2. The default sample data will be displayed as interactive circles
3. Drag circles to arrange them as desired
4. To visualize your own data, edit the JSON in the text area
5. Click "Update Visualization" to apply your changes
6. Use "Reset Positions" to randomize circle placement
7. Use "Download Image" to save your visualization as a PNG file

## JSON Data Format

The application accepts data in JSON format with key-value pairs:
- Keys: The words/labels to display in the circles
- Values: Numeric values that determine the circle size

Example:
```json
{
  "Staff": 5,
  "Members": 9,
  "Security": 1,
  "Testers": 7,
  "Developers": 3,
  "Visitors": 2
}
```

## Technologies Used

- HTML5 & CSS3
- JavaScript (ES6+)
- Tailwind CSS for modern UI components
- Font Awesome for icons
- html2canvas for image export functionality

## Customization

You can easily customize the application by:
- Editing the styles.css file to change visual appearance
- Modifying the circle sizing algorithm in script.js
- Adjusting the color generation to match your brand's palette

## Future Enhancements

Planned features for future releases:
- Color theme selection
- Additional visualization layouts
- Data import from CSV/Excel
- Animation options for circle movement
- Sharing capabilities

## License

Open source under the MIT License.

---

&copy; 2025 VizuSphere | Interactive Data Visualization Tool