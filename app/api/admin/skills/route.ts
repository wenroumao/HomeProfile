import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.resolve(process.cwd(), 'settings.json');

// Helper function to read settings.json
function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    // If settings.json doesn't exist, create it with an empty skills array
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ skills: [] }, null, 2));
    return { skills: [] };
  }
  try {
    const fileContent = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing settings.json:", error);
    // If parsing fails, return a default structure to avoid breaking the app
    return { skills: [] }; 
  }
}

// Helper function to write to settings.json
function writeSettings(data: any) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to settings.json:", error);
    throw new Error('Failed to write settings.'); // Propagate error for API response
  }
}

export async function GET() {
  try {
    const settings = readSettings();
    const skillsData = settings.skills || []; // Ensure skills always an array
    return NextResponse.json(skillsData);
  } catch (error) {
    console.error('Error fetching skills data:', error);
    return NextResponse.json({ message: 'Error fetching skills data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSkillsData = await request.json();
    if (!Array.isArray(newSkillsData)) {
      return NextResponse.json({ message: 'Invalid skills data format' }, { status: 400 });
    }

    const settings = readSettings();
    const updatedSettings = {
      ...settings,
      skills: newSkillsData,
    };
    writeSettings(updatedSettings);
    
    return NextResponse.json({ message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Error updating skills data:', error);
    // Check if it's a known error from writeSettings, otherwise generic message
    const errorMessage = error instanceof Error && error.message === 'Failed to write settings.' 
      ? error.message 
      : 'Error updating skills data';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 