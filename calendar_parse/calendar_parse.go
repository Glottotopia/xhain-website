package main

import (
	"bytes"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/apognu/gocal"
)

func main() {
	url := "https://files.x-hain.de/remote.php/dav/public-calendars/Yi63cicwgDnjaBHR/?export"

	// Fetch and read ICS file
	data, err := fetchICalData(url)
	if err != nil {
		log.Printf("Failed to fetch or read the ICS file: %v\n", err)
		return
	}

	// Parse ICS file
	events, err := parseICSData(data)
	if err != nil {
		log.Printf("Failed to parse the ICS file: %v\n", err)
		return
	}
	// Render HTML
	generatedHTML, err := generateHTML(events)
	if err != nil {
		log.Printf("Error generating HTML: %v\n", err)
		return
	}

	// Include HTML in Hugo
	if err := writeOutput(generatedHTML, "../content/de/calendar.md"); err != nil {
		log.Printf("Error writing output: %v\n", err)
	}

	if err := writeOutput(generatedHTML, "../content/en/calendar.md"); err != nil {
		log.Printf("Error writing output: %v\n", err)
	}
}

func fetchICalData(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	icsData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return icsData, nil
}

func parseICSData(icsData []byte) ([]gocal.Event, error) {
	c := gocal.NewParser(bytes.NewReader(icsData))

	// Only process this and next month
	now := time.Now()
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	end := start.AddDate(0, 2, -1)
	c.Start, c.End = &start, &end

	if err := c.Parse(); err != nil {
		return nil, err
	}

	// Sort the events by their start date
	sort.Slice(c.Events, func(i, j int) bool {
		return c.Events[i].Start.Before(*c.Events[j].Start)
	})

	return c.Events, nil
}

func generateHTML(events []gocal.Event) (string, error) {
	// Define your template functions
	funcMap := template.FuncMap{
		"monthName": func(month string) string {
			t, _ := time.Parse("01", month)
			return t.Format("January")
		},
		"isToday": func(t *time.Time) bool {
			return t.Format("2006-01-02") == time.Now().Format("2006-01-02")
		},
		"weekdayName": func(d time.Weekday) string {
			return d.String()
		},
		"now": func() time.Time {
			return time.Now()
		},
	}

	// Create a new template, attach the functions, and then parse the file
	t, err := template.New("template.html").Funcs(funcMap).ParseFiles("template.html")
	if err != nil {
		return "", err
	}

	// Group events by year and month
	groupedEvents := make(map[int]map[string][]gocal.Event)
	for _, e := range events {
		year := e.Start.Year()
		month := e.Start.Format("01")

		if groupedEvents[year] == nil {
			groupedEvents[year] = make(map[string][]gocal.Event)
		}

		groupedEvents[year][month] = append(groupedEvents[year][month], e)
	}

	// Generate HTML string
	var htmlBuffer bytes.Buffer
	if err := t.ExecuteTemplate(&htmlBuffer, "template.html", groupedEvents); err != nil {
		return "", err
	}
	return htmlBuffer.String(), nil
}

func writeOutput(generatedHTML, filePath string) error {
	// Read the contents of the markdown file
	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	// Replace the string
	updatedContent := strings.ReplaceAll(string(content), "%%%XHAINCALENDAR%%%", generatedHTML)

	// Write the updated content back to the file
	return os.WriteFile(filePath, []byte(updatedContent), 0644)
}
