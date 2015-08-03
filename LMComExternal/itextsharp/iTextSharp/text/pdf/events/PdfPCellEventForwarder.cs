using System;
using System.Collections;
using iTextSharp.text;
using iTextSharp.text.pdf;
/*
 * $Id: PdfPCellEventForwarder.cs,v 1.2 2009/06/04 15:39:54 pavel Exp $
 * 
 *
 * Copyright 2005 Bruno Lowagie
 *
 * The contents of this file are subject to the Mozilla Public License Version 1.1
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the License.
 *
 * The Original Code is 'iText, a free JAVA-PDF library'.
 *
 * The Initial Developer of the Original Code is Bruno Lowagie. Portions created by
 * the Initial Developer are Copyright (C) 1999, 2000, 2001, 2002 by Bruno Lowagie.
 * All Rights Reserved.
 * Co-Developer of the code is Paulo Soares. Portions created by the Co-Developer
 * are Copyright (C) 2000, 2001, 2002 by Paulo Soares. All Rights Reserved.
 *
 * Contributor(s): all the names of the contributors are added in the source code
 * where applicable.
 *
 * Alternatively, the contents of this file may be used under the terms of the
 * LGPL license (the "GNU LIBRARY GENERAL PUBLIC LICENSE"), in which case the
 * provisions of LGPL are applicable instead of those above.  If you wish to
 * allow use of your version of this file only under the terms of the LGPL
 * License and not to allow others to use your version of this file under
 * the MPL, indicate your decision by deleting the provisions above and
 * replace them with the notice and other provisions required by the LGPL.
 * If you do not delete the provisions above, a recipient may use your version
 * of this file under either the MPL or the GNU LIBRARY GENERAL PUBLIC LICENSE.
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the MPL as stated above or under the terms of the GNU
 * Library General Public License as published by the Free Software Foundation;
 * either version 2 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Library general Public License for more
 * details.
 *
 * If you didn't download this code from the following link, you should check if
 * you aren't using an obsolete version:
 * http://www.lowagie.com/iText/
 */

namespace iTextSharp.text.pdf.events {

    /**
    * If you want to add more than one event to a cell,
    * you have to construct a PdfPCellEventForwarder, add the
    * different events to this object and add the forwarder to
    * the PdfPCell.
    */

    public class PdfPCellEventForwarder : IPdfPCellEvent {

        /** ArrayList containing all the PageEvents that have to be executed. */
        protected ArrayList events = new ArrayList();
        
        /** 
        * Add a page event to the forwarder.
        * @param event an event that has to be added to the forwarder.
        */
        public void AddCellEvent(IPdfPCellEvent eventa) {
            events.Add(eventa);
        }

        /**
        * @see com.lowagie.text.pdf.PdfPCellEvent#cellLayout(com.lowagie.text.pdf.PdfPCell, com.lowagie.text.Rectangle, com.lowagie.text.pdf.PdfContentByte[])
        */
        public void CellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            foreach (IPdfPCellEvent eventa in events) {
                eventa.CellLayout(cell, position, canvases);
            }
        }
    }
}