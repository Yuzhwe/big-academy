import type {Meta,StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from 'react-aria-components';
import {BAOverlay} from './BAOverlay';
function Example(){const [open,setOpen]=useState(false);return <BAOverlay open={open} onOpenChange={setOpen} title="All activity screens" trigger={<Button>All activity screens</Button>}><p>1 Learn</p><p>2 Select</p></BAOverlay>;}
const meta={title:'UI/BAOverlay',component:Example} satisfies Meta<typeof Example>;
export default meta;type Story=StoryObj<typeof meta>;
export const Closed:Story={};
